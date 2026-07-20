"use client";

/**
 * CountryImage.tsx
 *
 * Hero photo shown at the top of the info panel — pulled from Wikipedia's
 * lead image for the country's article. Falls back to the flag image
 * (not blurred — a plain, honest fallback) when:
 *   - Wikipedia has no lead image for that article, or
 *   - the request is still loading (briefly shows a skeleton instead).
 *
 * No rounded corners here on purpose: the panel itself is flush against
 * the top of its container in the new layout, so this image sits flush
 * against that same edge.
 */

import { useCountryImage } from "../hooks/useCountryImage";

interface CountryImageProps {
  countryName: string;
  flagFallbackSrc: string;
}

export function CountryImage({ countryName, flagFallbackSrc }: CountryImageProps) {
  const { data: imageUrl, isLoading } = useCountryImage(countryName);

  if (isLoading) {
    return <div className="w-full h-44 shrink-0 bg-ui-border/30 animate-pulse" />;
  }

  const src = imageUrl ?? flagFallbackSrc;

  return (
    <div className="w-full h-44 shrink-0 overflow-hidden bg-ui-bg">
      <img
        src={src}
        alt={`Photo of ${countryName}`}
        className="w-full h-full object-cover"
      />
    </div>
  );
}