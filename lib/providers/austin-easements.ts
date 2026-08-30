import { intersectPolygons, type EsriPolygonGeometry, asEsriPolygon } from "@/lib/providers/austin-geometry";

const AUSTIN_EASEMENTS = "https://maps.austintexas.gov/gis/rest/Shared/Property/MapServer/4/query";

export const austinEasementSource = {
  layer: "https://maps.austintexas.gov/gis/rest/Shared/Property/MapServer/4",
  authority: "City of Austin Geospatial Services",
  limitation: "Austin Property Profile states that not all easements for a property have been mapped. A zero-result screen must not be treated as proof that no easement exists.",
} as const;

type EasementFeature = {
  attributes?: Record<string, unknown>;
  geometry?: unknown;
};

type EasementResponse = {
  features?: EasementFeature[];
  error?: { message?: string; details?: string[] };
};

export type AustinMappedEasement = {
  type: string | null;
  use: string | null;
  status: string | null;
  fileNumber: string | null;
  documentType: string | null;
  documentId: string | null;
};

export type AustinEasementScreen = {
  mappedRecordCount: number;
  potentiallyActiveCount: number;
  releasedCount: number;
  potentiallyActiveRecords: AustinMappedEasement[];
  statuses: string[];
  types: string[];
  uses: string[];
  polygons: EsriPolygonGeometry[];
  fetchedAt: string;
  source: typeof austinEasementSource;
  scope: "parcel_intersection_screen";
};

function stringValue(attributes: Record<string, unknown> | undefined, key: string) {
  const value = attributes?.[key];
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number") return String(value);
  return null;
}

function unique(values: Array<string | null>) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}

export async function lookupAustinMappedEasements(parcel: EsriPolygonGeometry): Promise<AustinEasementScreen> {
  const query = new URLSearchParams({
    f: "json",
    geometry: JSON.stringify(parcel),
    geometryType: "esriGeometryPolygon",
    inSR: "4326",
    spatialRel: "esriSpatialRelIntersects",
    outFields: "EASEMENT_TYPE,EASEMENT_USE,EASEMENT_STATUS,FILE_NUMBER,DOCUMENT_TYPE,DOCUMENT_ID",
    returnGeometry: "true",
    outSR: "4326",
  });

  const response = await fetch(`${AUSTIN_EASEMENTS}?${query.toString()}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 60 * 60 * 12 },
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) throw new Error(`Austin easement request failed with ${response.status}`);
  const data = (await response.json()) as EasementResponse;
  if (data.error) throw new Error(data.error.message || "Austin easement layer returned an error");

  const mapped = (data.features ?? []).map((feature) => ({
    record: {
      type: stringValue(feature.attributes, "EASEMENT_TYPE"),
      use: stringValue(feature.attributes, "EASEMENT_USE"),
      status: stringValue(feature.attributes, "EASEMENT_STATUS"),
      fileNumber: stringValue(feature.attributes, "FILE_NUMBER"),
      documentType: stringValue(feature.attributes, "DOCUMENT_TYPE"),
      documentId: stringValue(feature.attributes, "DOCUMENT_ID"),
    } satisfies AustinMappedEasement,
    geometry: asEsriPolygon(feature.geometry),
  }));

  const potentiallyActive = mapped.filter(({ record }) => record.status?.toUpperCase() !== "RELEASED");
  const rawPolygons = potentiallyActive
    .map(({ geometry }) => geometry)
    .filter((geometry): geometry is EsriPolygonGeometry => geometry !== null);

  let clippedPolygons: EsriPolygonGeometry[] = [];
  try {
    clippedPolygons = await intersectPolygons(rawPolygons, parcel);
  } catch {
    clippedPolygons = [];
  }

  return {
    mappedRecordCount: mapped.length,
    potentiallyActiveCount: potentiallyActive.length,
    releasedCount: mapped.length - potentiallyActive.length,
    potentiallyActiveRecords: potentiallyActive.map(({ record }) => record),
    statuses: unique(mapped.map(({ record }) => record.status)),
    types: unique(potentiallyActive.map(({ record }) => record.type)),
    uses: unique(potentiallyActive.map(({ record }) => record.use)),
    polygons: clippedPolygons,
    fetchedAt: new Date().toISOString(),
    source: austinEasementSource,
    scope: "parcel_intersection_screen",
  };
}
