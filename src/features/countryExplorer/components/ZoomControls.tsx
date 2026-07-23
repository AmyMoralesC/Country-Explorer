"use client";

/**
 * Floating zoom/reset/pan controls overlay for the WorldMap.
 */

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export function ZoomControls({ zoom, onZoomIn, onZoomOut, onReset }: ZoomControlsProps) {
  return (
    <div className="absolute bottom-3 right-3 flex flex-col gap-1">
      <button
        onClick={onZoomIn}
        aria-label="Zoom in"
        className="flex items-center justify-center w-10 h-10 md:w-8 md:h-8 rounded-lg bg-ui-surface/90 border border-ui-border text-ui-text-primary shadow-card hover:bg-ui-surface transition-colors text-lg font-light"
      >
        +
      </button>
      <button
        onClick={onReset}
        aria-label="Reset zoom and pan"
        className="flex items-center justify-center w-10 h-10 md:w-8 md:h-8 rounded-lg bg-ui-surface/90 border border-ui-border text-ui-text-muted shadow-card hover:bg-ui-surface transition-colors text-xs"
      >
        ↺
      </button>
      <button
        onClick={onZoomOut}
        aria-label="Zoom out"
        className="flex items-center justify-center w-10 h-10 md:w-8 md:h-8 rounded-lg bg-ui-surface/90 border border-ui-border text-ui-text-primary shadow-card hover:bg-ui-surface transition-colors text-lg font-light"
      >
        −
      </button>
      <span className="text-center text-[10px] text-ui-text-muted font-mono">
        {Math.round(zoom * 100)}%
      </span>
    </div>
  );
}