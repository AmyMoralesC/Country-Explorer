/**
 * EmptyState.tsx
 *
 * Displayed in the info panel when no country has been selected yet.
 * No border/rounded corners here — the panel itself is the flush-edged
 * container now, so this just centers its content within it.
 *
 * min-h-[280px] on mobile: the panel sits below the map with natural
 * (auto) height there, so a plain h-full would resolve to 0px — there's
 * no ancestor with an explicit height to inherit from. On desktop the
 * panel IS full-height (md:h-full on the <aside>), so h-full there works
 * as intended.
 */

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[280px] md:h-full text-center p-8">
      <div className="text-5xl mb-4" aria-hidden="true">🌍</div>
      <h3 className="text-base font-semibold text-ui-text-primary mb-1">
        Select a country
      </h3>
      <p className="text-sm text-ui-text-muted max-w-[200px]">
        Click any country on the map, search by name, or hit the dice for a random pick.
      </p>
    </div>
  );
}