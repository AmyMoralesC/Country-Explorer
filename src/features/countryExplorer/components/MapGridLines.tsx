/**
 * MapGridLines.tsx
 * Decorative latitude/longitude reference grid for the SVG map.
 * Uses the map-border token (at low opacity) instead of a fixed hex color
 * so the grid stays subtle and correctly-toned in both light and dark mode.
 */

import { MAP_WIDTH, MAP_HEIGHT } from "../utils/projection";

export function MapGridLines() {
  const lines: React.ReactNode[] = [];

  for (let i = 0; i <= MAP_WIDTH; i += MAP_WIDTH / 18) {
    lines.push(
      <line key={`v${i}`} x1={i} y1={0} x2={i} y2={MAP_HEIGHT}
        className="stroke-map-border/40" strokeWidth={0.3} strokeDasharray="2,4" />
    );
  }
  for (let j = 0; j <= MAP_HEIGHT; j += MAP_HEIGHT / 9) {
    lines.push(
      <line key={`h${j}`} x1={0} y1={j} x2={MAP_WIDTH} y2={j}
        className="stroke-map-border/40" strokeWidth={0.3} strokeDasharray="2,4" />
    );
  }
  return <g>{lines}</g>;
}