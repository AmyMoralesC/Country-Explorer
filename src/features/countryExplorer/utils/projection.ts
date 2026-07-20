/**
 * Converts geographic coordinates (latitude/longitude) to SVG pixel positions.
 *
 * We use the Equirectangular (Plate Carrée) projection — the simplest possible:
 * it maps longitude linearly to X and latitude linearly to Y.
 * It distorts area near the poles, but it matches the Natural Earth GeoJSON
 * dataset we're using, so paths and country dots align correctly.
 *
 * Vertical layout: Antarctica's coastline reaches the true South Pole
 * (latitude -90), so a plain linear mapping puts it flush against the
 * bottom edge automatically — which is what we want. The northernmost
 * landmass (Greenland, ~83.6°N) falls well short of the North Pole (90°N),
 * so the same linear mapping leaves only a sliver of ocean at the top
 * (about 3.5% of the map height), which reads as "cramped" rather than
 * as deliberate framing. TOP_PADDING adds a fixed band of extra canvas
 * height above the projection, giving the Arctic some breathing room
 * without touching the equirectangular math or shifting Antarctica.
 */

export const MAP_WIDTH = 1000;

// Height of the actual equirectangular projection (lat -90..90 → 0..MAP_BASE_HEIGHT).
const MAP_BASE_HEIGHT = 542;

// Extra ocean band reserved above the projection — purely cosmetic framing.
const TOP_PADDING = 8;

// Total SVG canvas height (what the viewBox and background actually use).
export const MAP_HEIGHT = MAP_BASE_HEIGHT + TOP_PADDING;

/**
 * Projects a [lat, lng] pair to SVG [x, y] coordinates.
 * Latitude range:  +90 (top of projection) to -90 (bottom, flush with
 *   MAP_HEIGHT since Antarctica reaches the pole) → Y: TOP_PADDING..MAP_HEIGHT
 * Longitude range: -180 (left) to +180 (right) → X: 0..MAP_WIDTH
 */
export function project(lat: number, lng: number): [number, number] {
  const x = ((lng + 180) / 360) * MAP_WIDTH;
  const y = TOP_PADDING + ((90 - lat) / 180) * MAP_BASE_HEIGHT;
  return [x, y];
}

/**
 * Converts a GeoJSON coordinate ring (array of [lng, lat] pairs) into an
 * SVG path "d" attribute string.
 *
 * Note: GeoJSON uses [longitude, latitude] order (opposite of most APIs).
 */
export function ringToPath(ring: number[][]): string {
  return ring
    .map(([lng, lat], index) => {
      if (lng === undefined || lat === undefined) return "";
      const [x, y] = project(lat, lng);
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .filter(Boolean)
    .join(" ") + " Z";
}

/**
 * Converts a GeoJSON geometry (Polygon or MultiPolygon) to a single
 * SVG path "d" string. MultiPolygons (e.g. island nations, USA with Alaska)
 * are represented as multiple subpaths within one <path> element.
 */
export function geometryToPath(geometry: {
  type: "Polygon" | "MultiPolygon";
  coordinates: number[][][] | number[][][][];
}): string {
  if (geometry.type === "Polygon") {
    // Polygon: coordinates is number[][][] — array of rings (outer + holes)
    const rings = geometry.coordinates as number[][][];
    return rings.map(ringToPath).join(" ");
  }

  // MultiPolygon: coordinates is number[][][][] — array of polygons
  const multiPolygon = geometry.coordinates as number[][][][];
  return multiPolygon
    .flatMap((polygon) => polygon.map(ringToPath))
    .join(" ");
}