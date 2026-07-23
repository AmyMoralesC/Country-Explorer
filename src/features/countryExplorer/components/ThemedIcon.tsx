/**
 * Renders the black or white variant of an icon from /public/icons
 * depending on the active theme — purely via CSS (dark:hidden /
 * dark:block), no JS theme reads needed here. Both images sit in the DOM;
 * only one is ever visible, and the switch is instant when .dark toggles.
 */

interface ThemedIconProps {
  name: string;
  className?: string;
  alt?: string;
}

export function ThemedIcon({ name, className = "w-4 h-4", alt = "" }: ThemedIconProps) {
  return (
    <>
      <img
        src={`/icons/${name}_black.png`}
        alt={alt}
        aria-hidden={alt === ""}
        className={`${className} dark:hidden`}
      />
      <img
        src={`/icons/${name}_white.png`}
        alt={alt}
        aria-hidden={alt === ""}
        className={`${className} hidden dark:block`}
      />
    </>
  );
}