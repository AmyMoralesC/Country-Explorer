/**
 * All pan/zoom state and gesture handling for the world map, in one place:
 *   - Mouse: click-drag to pan, wheel to zoom.
 *   - Touch: one-finger drag to pan, two-finger pinch to zoom (with the
 *     pinch midpoint also panning, so it feels like a normal map app
 *     rather than a fixed-center zoom).
 */

import { useRef, useState, useCallback, useEffect } from "react";
import { MAP_WIDTH, MAP_HEIGHT } from "../utils/projection";

const MIN_ZOOM = 1;
const MAX_ZOOM = 8;
const ZOOM_STEP = 0.001;

function touchDistance(a: { clientX: number; clientY: number }, b: { clientX: number; clientY: number }) {
  return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
}

function touchMidpoint(a: { clientX: number; clientY: number }, b: { clientX: number; clientY: number }) {
  return { x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 };
}

interface TouchGesture {
  mode: "pan" | "pinch" | null;
  startX: number;
  startY: number;
  panX: number;
  panY: number;
  startDistance: number;
  startZoom: number;
}

export function useMapInteraction() {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const touchGesture = useRef<TouchGesture>({
    mode: null, startX: 0, startY: 0, panX: 0, panY: 0, startDistance: 0, startZoom: 1,
  });

  // Always-fresh mirrors of the latest state.
  const panRef = useRef(pan);
  const zoomRef = useRef(zoom);
  useEffect(() => { panRef.current = pan; }, [pan]);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);

  // Both axes are clamped so the map can never be dragged past its own
  // edges — like Google Maps' boundary behavior. At MIN_ZOOM the map exactly
  // fills the viewport, so the allowed range collapses to zero and panning
  // is blocked entirely in both directions, which is the "wall" effect.
  const clampPan = useCallback((x: number, y: number, currentZoom: number) => {
    const minX = MAP_WIDTH - MAP_WIDTH * currentZoom;
    const maxX = 0;
    const minY = MAP_HEIGHT - MAP_HEIGHT * currentZoom;
    const maxY = 0;
    return {
      x: Math.min(maxX, Math.max(minX, x)),
      y: Math.min(maxY, Math.max(minY, y)),
    };
  }, []);

  // Re-clamp whenever zoom changes (e.g. zooming out after having panned
  // near an edge would otherwise leave pan outside the new bounds).
  useEffect(() => {
    setPan((prev) => clampPan(prev.x, prev.y, zoom));
  }, [zoom, clampPan]);

  // ── Mouse ────────────────────────────────────────────────────────────
  const handleWheel = useCallback((e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    setZoom((prev) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev - e.deltaY * ZOOM_STEP)));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    const nextX = dragStart.current.panX + (e.clientX - dragStart.current.x);
    const nextY = dragStart.current.panY + (e.clientY - dragStart.current.y);
    setPan(clampPan(nextX, nextY, zoom));
  }, [isDragging, zoom, clampPan]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  // ── Touch — one combined native effect for start/move/end/cancel ─────
  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    function onTouchStart(e: TouchEvent) {
      if (e.touches.length === 1) {
        const t = e.touches[0];
        if (!t) return;
        touchGesture.current = {
          mode: "pan",
          startX: t.clientX,
          startY: t.clientY,
          panX: panRef.current.x,
          panY: panRef.current.y,
          startDistance: 0,
          startZoom: zoomRef.current,
        };
      } else if (e.touches.length === 2) {
        const [a, b] = [e.touches[0], e.touches[1]];
        if (!a || !b) return;
        const mid = touchMidpoint(a, b);
        touchGesture.current = {
          mode: "pinch",
          startX: mid.x,
          startY: mid.y,
          panX: panRef.current.x,
          panY: panRef.current.y,
          startDistance: touchDistance(a, b),
          startZoom: zoomRef.current,
        };
      }
    }

    function onTouchMove(e: TouchEvent) {
      const gesture = touchGesture.current;

      if (gesture.mode === "pan" && e.touches.length === 1) {
        e.preventDefault();
        const t = e.touches[0];
        if (!t) return;
        const nextX = gesture.panX + (t.clientX - gesture.startX);
        const nextY = gesture.panY + (t.clientY - gesture.startY);
        setPan(clampPan(nextX, nextY, gesture.startZoom));
      } else if (gesture.mode === "pinch" && e.touches.length === 2) {
        e.preventDefault();
        const [a, b] = [e.touches[0], e.touches[1]];
        if (!a || !b) return;

        const distance = touchDistance(a, b);
        const scaleRatio = distance / gesture.startDistance;
        const nextZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, gesture.startZoom * scaleRatio));

        const mid = touchMidpoint(a, b);
        const nextX = gesture.panX + (mid.x - gesture.startX);
        const nextY = gesture.panY + (mid.y - gesture.startY);

        setZoom(nextZoom);
        setPan(clampPan(nextX, nextY, nextZoom));
      }
    }

    function onTouchEnd(e: TouchEvent) {
      // Going from 2 fingers to 1 (instead of releasing entirely) re-arms
      // pan mode from the current position, so the gesture continues
      // smoothly instead of just stopping.
      if (e.touches.length === 1) {
        const t = e.touches[0];
        if (!t) return;
        touchGesture.current = {
          mode: "pan",
          startX: t.clientX,
          startY: t.clientY,
          panX: panRef.current.x,
          panY: panRef.current.y,
          startDistance: 0,
          startZoom: zoomRef.current,
        };
      } else if (e.touches.length === 0) {
        touchGesture.current.mode = null;
      }
    }

    svgEl.addEventListener("touchstart", onTouchStart, { passive: true });
    svgEl.addEventListener("touchmove", onTouchMove, { passive: false });
    svgEl.addEventListener("touchend", onTouchEnd, { passive: true });
    svgEl.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      svgEl.removeEventListener("touchstart", onTouchStart);
      svgEl.removeEventListener("touchmove", onTouchMove);
      svgEl.removeEventListener("touchend", onTouchEnd);
      svgEl.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [clampPan]);

  // ── Button controls (ZoomControls) ─────────────────────────────────
  const zoomIn = useCallback(() => setZoom((z) => Math.min(MAX_ZOOM, z + 0.5)), []);
  const zoomOut = useCallback(() => setZoom((z) => Math.max(MIN_ZOOM, z - 0.5)), []);
  const reset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  return {
    zoom,
    pan,
    isDragging,
    svgRef,
    zoomIn,
    zoomOut,
    reset,
    // Mouse handlers only now
    handlers: {
      onWheel: handleWheel,
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseUp,
    },
  };
}