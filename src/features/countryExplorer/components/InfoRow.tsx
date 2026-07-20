/**
 * InfoRow.tsx
 *
 * A simple icon + label + value display row.
 * Extracted to avoid repeating the same div/span structure 6+ times
 * in CountryCard — DRY principle in action.
 *
 * `icon` is a path to a PNG asset (e.g. "/icons/government_black.png"),
 * not an emoji — this matches the custom icon set used throughout the
 * panel, which also ships white variants for future dark-mode support.
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
        {icon && <img src={icon} alt="" aria-hidden="true" className="w-4 h-4 opacity-70" />}
        {label}
      </span>
      <span className="text-xs text-ui-text-primary font-medium text-right">
        {value}
      </span>
    </div>
  );
}