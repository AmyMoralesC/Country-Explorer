/**
 * StatBox.tsx
 *
 * A small labeled stat card used in 2-column grids (currency + GINI,
 * coordinates + area). Extracted from CountryCard so both the card and
 * this file stay under the project's per-component line limit.
 *
 * `icon` is an icon NAME (e.g. "coins"), same convention as InfoRow —
 * ThemedIcon resolves it to the correct black/white PNG for the theme.
 */

import { ThemedIcon } from "./ThemedIcon";

interface StatBoxProps {
  label: string;
  value: string;
  icon: string;
}

export function StatBox({ label, value, icon }: StatBoxProps) {
  return (
    <div className="flex flex-col gap-0.5 p-2.5 rounded-lg bg-ui-bg border border-ui-border">
      <span className="text-[10px] uppercase tracking-wider text-ui-text-muted flex items-center gap-1">
        <ThemedIcon name={icon} className="w-3.5 h-3.5 opacity-70" />
        {label}
      </span>
      <span className="text-sm font-semibold text-ui-text-primary leading-tight">
        {value}
      </span>
    </div>
  );
}