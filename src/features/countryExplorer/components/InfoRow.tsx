/**
 * InfoRow.tsx
 *
 * A simple icon + label + value display row.
 * Extracted to avoid repeating the same div/span structure 6+ times
 * in CountryCard — DRY principle in action.
 *
 * `icon` is an icon NAME (e.g. "government"), not a file path — ThemedIcon
 * resolves it to the correct black/white PNG for the active theme.
 */

import { clsx } from "clsx";
import { ThemedIcon } from "./ThemedIcon";

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
        {icon && <ThemedIcon name={icon} className="w-4 h-4 opacity-70" />}
        {label}
      </span>
      <span className="text-xs text-ui-text-primary font-medium text-right">
        {value}
      </span>
    </div>
  );
}