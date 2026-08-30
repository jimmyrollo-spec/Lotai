const AUSTIN_GEOCODER = "https://maps.austintexas.gov/arcgis/rest/services/Geocode/COA_Locator/GeocodeServer/findAddressCandidates";
const AUSTIN_ZONING = "https://maps.austintexas.gov/gis/rest/Shared/Zoning_1/MapServer/0/query";
const AUSTIN_PARCELS = "https://maps.austintexas.gov/gis/rest/Shared/AppraisalDistricts/MapServer/0/query";
const AUSTIN_JURISDICTION = "https://maps.austintexas.gov/gis/rest/Shared/JurisdictionsFill/MapServer/0/query";

export const austinSourceLinks = {
  propertyProfile: "https://www.austintexas.gov/development-services/property-profile-overview",
  geocoder: "https://maps.austintexas.gov/arcgis/rest/services/Geocode/COA_Locator/GeocodeServer",
  zoning: "https://maps.austintexas.gov/gis/rest/Shared/Zoning_1/MapServer/0",
  parcels: "https://maps.austintexas.gov/gis/rest/Shared/AppraisalDistricts/MapServer/0",
  jurisdiction: "https://maps.austintexas.gov/gis/rest/Shared/JurisdictionsFill/MapServer/0",
} as const;

type ArcGisCandidate = {
  address?: string;
  score?: number;
  location?: { x?: number; y?: number };
  attributes?: Record<string, unknown>;
};

type ArcGisFeature = {
  attributes?: Record<string, unknown>;
  geometry?: unknown;
};

type ArcGisResponse = {
  candidates?: ArcGisCandidate[];
  features?: ArcGisFeature[];
  error?: { message?: string; details?: string[] };
};

export type AustinPropertyMatch = {
  provider: "city_of_austin";
  sourceType: "official_gis";
  matchedAddress: string;
  matchScore: number;
  location: { longitude: number; latitude: number };
  parcel: {
    parcelId: string | null;
    propertyId: string | null;
    geometry: unknown | null;
  };
  zoning: {
    zoningType: string | null;
    baseDistrict: string | null;
  };
  jurisdiction: {
    label: string | null;
  };
  fetchedAt: string;
  sources: typeof austinSourceLinks;
};

function firstString(record: Record<string, unknown> | undefined, keys: string[]) {
  if (!record) return null;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return null;
}

async function fetchArcGis(url: string, params: Record<string, string>): Promise<ArcGisResponse> {
  const search = new URLSearchParams(params);
  const response = await fetch(`${url}?${search.toString()}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 60 * 60 * 12 },
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) throw new Error(`Austin GIS request failed with ${response.status}`);
  const data = (await response.json()) as ArcGisResponse;
  if (data.error) throw new Error(data.error.message || "Austin GIS returned an error");
  return data;
}

async function spatialQuery(url: string, longitude: number, latitude: number, returnGeometry = false) {
  return fetchArcGis(url, {
    f: "json",
    geometry: `${longitude},${latitude}`,
    geometryType: "esriGeometryPoint",
    inSR: "4326",
    spatialRel: "esriSpatialRelIntersects",
    outFields: "*",
    returnGeometry: returnGeometry ? "true" : "false",
    outSR: "4326",
  });
}

export async function lookupAustinProperty(address: string): Promise<AustinPropertyMatch | null> {
  const normalized = address.trim();
  if (!normalized || normalized.toLowerCase() === "sample property") return null;

  const geocode = await fetchArcGis(AUSTIN_GEOCODER, {
    f: "json",
    SingleLine: normalized,
    outFields: "*",
    outSR: "4326",
    maxLocations: "3",
  });

  const candidate = geocode.candidates?.find((item) => {
    const score = item.score ?? 0;
    const x = item.location?.x;
    const y = item.location?.y;
    return score >= 80 && typeof x === "number" && typeof y === "number";
  });

  if (!candidate || typeof candidate.location?.x !== "number" || typeof candidate.location?.y !== "number") {
    return null;
  }

  const longitude = candidate.location.x;
  const latitude = candidate.location.y;

  const [parcelResult, zoningResult, jurisdictionResult] = await Promise.all([
    spatialQuery(AUSTIN_PARCELS, longitude, latitude, true),
    spatialQuery(AUSTIN_ZONING, longitude, latitude),
    spatialQuery(AUSTIN_JURISDICTION, longitude, latitude),
  ]);

  const parcelFeature = parcelResult.features?.[0];
  const zoningFeature = zoningResult.features?.[0];
  const jurisdictionFeature = jurisdictionResult.features?.[0];

  return {
    provider: "city_of_austin",
    sourceType: "official_gis",
    matchedAddress: candidate.address || normalized,
    matchScore: candidate.score ?? 0,
    location: { longitude, latitude },
    parcel: {
      parcelId: firstString(parcelFeature?.attributes, ["PID_10", "PARCEL_ID", "PARCELID"]),
      propertyId: firstString(parcelFeature?.attributes, ["PROP_ID", "PROPERTY_ID", "PROPERTYID"]),
      geometry: parcelFeature?.geometry ?? null,
    },
    zoning: {
      zoningType: firstString(zoningFeature?.attributes, ["ZONING_ZTYPE", "ZONING", "ZONING_TYPE"]),
      baseDistrict: firstString(zoningFeature?.attributes, ["ZONING_BASE", "BASE_DISTRICT", "BASEZONE"]),
    },
    jurisdiction: {
      label: firstString(jurisdictionFeature?.attributes, ["JURISDICTION", "JURIS", "NAME", "LABEL", "FULL_NAME"]),
    },
    fetchedAt: new Date().toISOString(),
    sources: austinSourceLinks,
  };
}
