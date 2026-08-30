const AUSTIN_GEOMETRY_SERVER = "https://maps.austintexas.gov/arcgis/rest/services/Geometry/GeometryServer";

export const austinGeometrySource = {
  service: AUSTIN_GEOMETRY_SERVER,
  authority: "City of Austin ArcGIS GeometryServer",
  role: "Derived geometry operations on official mapped source polygons",
} as const;

export type EsriPolygonGeometry = {
  rings: number[][][];
  spatialReference?: Record<string, unknown>;
};

type GeometryServerError = {
  error?: {
    code?: number;
    message?: string;
    details?: string[];
  };
};

type AreasAndLengthsResponse = GeometryServerError & {
  areas?: number[];
  lengths?: number[];
};

type GeometrySetResponse = GeometryServerError & {
  geometryType?: string;
  geometries?: unknown[];
};

type UnionResponse = GeometryServerError & {
  geometry?: unknown;
};

export function asEsriPolygon(geometry: unknown): EsriPolygonGeometry | null {
  if (!geometry || typeof geometry !== "object") return null;
  const rings = (geometry as { rings?: unknown }).rings;
  if (!Array.isArray(rings) || rings.length === 0) return null;
  const valid = rings.every((ring) =>
    Array.isArray(ring) && ring.length >= 4 && ring.every((point) =>
      Array.isArray(point) && point.length >= 2 && typeof point[0] === "number" && Number.isFinite(point[0]) && typeof point[1] === "number" && Number.isFinite(point[1]),
    ),
  );
  return valid ? (geometry as EsriPolygonGeometry) : null;
}

async function postGeometry<T extends GeometryServerError>(path: string, params: Record<string, string>): Promise<T> {
  const response = await fetch(`${AUSTIN_GEOMETRY_SERVER}/${path}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params),
    cache: "no-store",
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) throw new Error(`Austin GeometryServer ${path} failed with ${response.status}`);
  const data = (await response.json()) as T;
  if (data.error) {
    const detail = data.error.details?.filter(Boolean).join("; ");
    throw new Error(data.error.message || detail || `Austin GeometryServer ${path} returned an error`);
  }
  return data;
}

export async function calculatePolygonAreasSqFt(polygons: EsriPolygonGeometry[]): Promise<number[]> {
  if (!polygons.length) return [];

  const data = await postGeometry<AreasAndLengthsResponse>("areasAndLengths", {
    f: "json",
    sr: "4326",
    polygons: JSON.stringify(polygons),
    areaUnit: JSON.stringify({ areaUnit: "esriSquareFeet" }),
    lengthUnit: "9002",
    calculationType: "geodesic",
  });

  if (!Array.isArray(data.areas) || data.areas.length !== polygons.length) {
    throw new Error("Austin GeometryServer returned an unexpected area result");
  }

  return data.areas.map((area) => Math.abs(Number(area)));
}

export async function calculatePolygonAreaSqFt(polygon: EsriPolygonGeometry): Promise<number> {
  const [area] = await calculatePolygonAreasSqFt([polygon]);
  if (!Number.isFinite(area)) throw new Error("Austin GeometryServer did not return a valid polygon area");
  return area;
}

export async function intersectPolygons(
  geometries: EsriPolygonGeometry[],
  mask: EsriPolygonGeometry,
): Promise<EsriPolygonGeometry[]> {
  if (!geometries.length) return [];

  const data = await postGeometry<GeometrySetResponse>("intersect", {
    f: "json",
    sr: "4326",
    geometries: JSON.stringify({ geometryType: "esriGeometryPolygon", geometries }),
    geometry: JSON.stringify({ geometryType: "esriGeometryPolygon", geometry: mask }),
  });

  return (data.geometries ?? [])
    .map((geometry) => asEsriPolygon(geometry))
    .filter((geometry): geometry is EsriPolygonGeometry => geometry !== null);
}

export async function unionPolygons(polygons: EsriPolygonGeometry[]): Promise<EsriPolygonGeometry | null> {
  if (!polygons.length) return null;
  if (polygons.length === 1) return polygons[0];

  const data = await postGeometry<UnionResponse>("union", {
    f: "json",
    sr: "4326",
    geometries: JSON.stringify({ geometryType: "esriGeometryPolygon", geometries: polygons }),
  });

  const geometry = asEsriPolygon(data.geometry);
  if (!geometry) throw new Error("Austin GeometryServer returned an unexpected union result");
  return geometry;
}

export async function calculateClippedUnionAreaSqFt(
  sourcePolygons: EsriPolygonGeometry[],
  parcel: EsriPolygonGeometry,
): Promise<{ areaSqFt: number; clippedPolygons: EsriPolygonGeometry[]; unionGeometry: EsriPolygonGeometry | null }> {
  if (!sourcePolygons.length) return { areaSqFt: 0, clippedPolygons: [], unionGeometry: null };

  const clippedPolygons = await intersectPolygons(sourcePolygons, parcel);
  if (!clippedPolygons.length) return { areaSqFt: 0, clippedPolygons: [], unionGeometry: null };

  const unionGeometry = await unionPolygons(clippedPolygons);
  if (!unionGeometry) return { areaSqFt: 0, clippedPolygons, unionGeometry: null };

  const areaSqFt = await calculatePolygonAreaSqFt(unionGeometry);
  return { areaSqFt, clippedPolygons, unionGeometry };
}
