/**
 * projection.ts
 *
 * Converts geographic coordinates (latitude/longitude) to SVG pixel positions.
 *
 * We use the Equirectangular (Plate Carrée) projection — the simplest possible:
 * it maps longitude linearly to X and latitude linearly to Y.
 * It distorts area near the poles, but it matches the Natural Earth 110m
 * GeoJSON dataset we're using, so paths and country dots align correctly.
 *
 * The SVG viewBox is 1000 × 507 — chosen to match Natural Earth's aspect ratio.
 */

export const MAP_WIDTH = 1000;
export const MAP_HEIGHT = 507;

/**
 * Projects a [lat, lng] pair to SVG [x, y] coordinates.
 * Latitude range:  +90 (top) to -90 (bottom)  → Y: 0 to MAP_HEIGHT
 * Longitude range: -180 (left) to +180 (right) → X: 0 to MAP_WIDTH
 */
export function project(lat: number, lng: number): [number, number] {
  const x = ((lng + 180) / 360) * MAP_WIDTH;
  const y = ((90 - lat) / 180) * MAP_HEIGHT;
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
