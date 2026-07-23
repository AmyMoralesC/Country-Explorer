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

  // Always-fresh mirrors of the latest state, for the native touch
  const panRef = useRef(pan);
  const zoomRef = useRef(zoom);
  useEffect(() => { panRef.current = pan; }, [pan]);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);

  // requestAnimationFrame batching.
  const rafId = useRef<number | null>(null);
  const pendingUpdate = useRef<{ x: number; y: number; zoom?: number } | null>(null);

  const scheduleUpdate = useCallback((next: { x: number; y: number; zoom?: number }) => {
    pendingUpdate.current = next;
    if (rafId.current !== null) return; // a frame is already scheduled

    rafId.current = requestAnimationFrame(() => {
      rafId.current = null;
      const update = pendingUpdate.current;
      if (!update) return;
      if (update.zoom !== undefined) setZoom(update.zoom);
      setPan({ x: update.x, y: update.y });
    });
  }, []);

  useEffect(() => {
    return () => {
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, []);

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
    const clamped = clampPan(nextX, nextY, zoom);
    scheduleUpdate(clamped);
  }, [isDragging, zoom, clampPan, scheduleUpdate]);

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
      if (gesture.mode === null) return;

      e.preventDefault();

      if (gesture.mode === "pan" && e.touches.length === 1) {
        const t = e.touches[0];
        if (!t) return;
        const nextX = gesture.panX + (t.clientX - gesture.startX);
        const nextY = gesture.panY + (t.clientY - gesture.startY);
        scheduleUpdate(clampPan(nextX, nextY, gesture.startZoom));
      } else if (gesture.mode === "pinch" && e.touches.length === 2) {
        const [a, b] = [e.touches[0], e.touches[1]];
        if (!a || !b) return;

        const distance = touchDistance(a, b);
        const scaleRatio = distance / gesture.startDistance;
        const nextZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, gesture.startZoom * scaleRatio));

        const mid = touchMidpoint(a, b);
        const nextX = gesture.panX + (mid.x - gesture.startX);
        const nextY = gesture.panY + (mid.y - gesture.startY);

        const clamped = clampPan(nextX, nextY, nextZoom);
        scheduleUpdate({ ...clamped, zoom: nextZoom });
      }
    }

    function onTouchEnd(e: TouchEvent) {
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
  }, [clampPan, scheduleUpdate]);

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
    // Mouse handlers only.
    handlers: {
      onWheel: handleWheel,
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseUp,
    },
  };
}