import type { EsriPolygonGeometry } from "@/lib/providers/austin";
import styles from "./OfficialParcelGraphic.module.css";

type Props = {
  geometry: EsriPolygonGeometry;
  location: { longitude: number; latitude: number };
  floodIntersects: boolean | null;
  buildingFootprints?: EsriPolygonGeometry[];
};

type Point = [number, number];

function normalizedRings(geometry: EsriPolygonGeometry) {
  const points = geometry.rings.flat().filter((point): point is Point =>
    Array.isArray(point) && point.length >= 2 && Number.isFinite(point[0]) && Number.isFinite(point[1]),
  );

  if (points.length < 3) return null;

  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const dx = Math.max(maxX - minX, 0.000001);
  const dy = Math.max(maxY - minY, 0.000001);
  const span = Math.max(dx, dy);
  const scale = 78 / span;
  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;

  function project([x, y]: Point) {
    return [50 + (x - midX) * scale, 50 - (y - midY) * scale] as Point;
  }

  return {
    rings: geometry.rings.map((ring) => ring.map((point) => project(point as Point))),
    project,
  };
}

function pathFromRings(rings: Point[][]) {
  return rings
    .map((ring) => ring.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(3)} ${y.toFixed(3)}`).join(" ") + " Z")
    .join(" ");
}

export function OfficialParcelGraphic({ geometry, location, floodIntersects, buildingFootprints = [] }: Props) {
  const normalized = normalizedRings(geometry);
  if (!normalized) return null;

  const path = pathFromRings(normalized.rings);
  const buildingPaths = buildingFootprints.map((building) =>
    pathFromRings(building.rings.map((ring) => ring.map((point) => normalized.project(point as Point)))),
  );
  const [pinX, pinY] = normalized.project([location.longitude, location.latitude]);

  return (
    <div className={styles.wrap}>
      <div className={styles.graphic}>
        <svg viewBox="0 0 100 100" role="img" aria-label="Official parcel boundary and mapped building footprints from City of Austin GIS">
          <defs>
            <pattern id="parcel-grid" width="5" height="5" patternUnits="userSpaceOnUse">
              <path d="M 5 0 L 0 0 0 5" fill="none" stroke="currentColor" strokeWidth="0.18" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="100" height="100" className={styles.background} />
          <rect x="0" y="0" width="100" height="100" fill="url(#parcel-grid)" className={styles.grid} />
          <path d={path} className={styles.parcelFill} fillRule="evenodd" />
          {buildingPaths.map((buildingPath, index) => (
            <path key={`${index}-${buildingPath.slice(0, 18)}`} d={buildingPath} className={styles.building} fillRule="evenodd" />
          ))}
          <path d={path} className={styles.parcelLine} fill="none" fillRule="evenodd" />
          <circle cx={pinX} cy={pinY} r="1.8" className={styles.pinHalo} />
          <circle cx={pinX} cy={pinY} r="0.9" className={styles.pin} />
        </svg>
        <span className={styles.north}>N</span>
        <span className={styles.source}>COA GIS · TCAD PARCEL + 2023 PLANIMETRICS</span>
      </div>

      <div className={styles.legend}>
        <div><i className={styles.parcelSwatch} /><span>Official parcel boundary</span></div>
        {buildingPaths.length > 0 && <div><i className={styles.buildingSwatch} /><span>{buildingPaths.length} mapped 2023 building footprint{buildingPaths.length === 1 ? "" : "s"}</span></div>}
        <div><i className={styles.pinSwatch} /><span>Matched address point</span></div>
        <div className={floodIntersects === true ? styles.warning : floodIntersects === false ? styles.clear : styles.unknown}>
          <i />
          <span>
            {floodIntersects === true
              ? "Parcel intersects a mapped Austin floodplain layer"
              : floodIntersects === false
                ? "No parcel intersection detected in queried Austin floodplain layers"
                : "Floodplain intersection not resolved"}
          </span>
        </div>
      </div>
    </div>
  );
}
