import { MAP_WIDTH, MAP_HEIGHT } from "../utils/projection";

export function MapGridLines() {
  const lines: React.ReactNode[] = [];
  let lineIndex = 0;

  for (let i = 0; i <= MAP_WIDTH; i += MAP_WIDTH / 18) {
    lines.push(
      <line
        key={`vline-${lineIndex}`}
        x1={i}
        y1={0}
        x2={i}
        y2={MAP_HEIGHT}
        stroke="#A8C4D8"
        strokeWidth={0.3}
        strokeDasharray="2,4"
      />
    );
    lineIndex++;
  }
  
  for (let j = 0; j <= MAP_HEIGHT; j += MAP_HEIGHT / 9) {
    lines.push(
      <line
        key={`hline-${lineIndex}`}
        x1={0}
        y1={j}
        x2={MAP_WIDTH}
        y2={j}
        stroke="#A8C4D8"
        strokeWidth={0.3}
        strokeDasharray="2,4"
      />
    );
    lineIndex++;
  }
  
  return <g>{lines}</g>;
}