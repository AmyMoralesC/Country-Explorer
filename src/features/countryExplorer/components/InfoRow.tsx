/**
 * InfoRow.tsx
 *
 * A simple label + value display row.
 * Extracted to avoid repeating the same div/span structure 10+ times
 * in CountryCard — DRY principle in action.
 *
 * The `icon` prop is optional: a small SVG or emoji that precedes the label.
 */

import { clsx } from "clsx";

interface InfoRowProps {
  label: string;
  value: string | number;
  icon?: string;
  className?: string;
}

export function InfoRow({ label, value, icon, className }: InfoRowProps) {
  return (
    <div className={clsx("flex items-start justify-between gap-2 py-1.5 border-b border-ui-border/50 last:border-0", className)}>
      <span className="flex items-center gap-1.5 text-xs text-ui-text-muted shrink-0">
        {icon && <span aria-hidden="true">{icon}</span>}
        {label}
      </span>
      <span className="text-xs text-ui-text-primary font-medium text-right">
        {value}
      </span>
    </div>
  );
}
