const AUSTIN_GEOCODER = "https://maps.austintexas.gov/arcgis/rest/services/Geocode/COA_Locator/GeocodeServer/findAddressCandidates";
const AUSTIN_ZONING = "https://maps.austintexas.gov/gis/rest/Shared/Zoning_1/MapServer/0/query";
const AUSTIN_PARCELS = "https://maps.austintexas.gov/gis/rest/Shared/AppraisalDistricts/MapServer/0/query";
const AUSTIN_JURISDICTION = "https://maps.austintexas.gov/gis/rest/Shared/JurisdictionsFill/MapServer/0/query";
const AUSTIN_FEMA_FLOODPLAIN = "https://maps.austintexas.gov/gis/rest/Shared/Floodplain/MapServer/1/query";
const AUSTIN_FULLY_DEVELOPED_FLOODPLAIN = "https://maps.austintexas.gov/gis/rest/Shared/Floodplain/MapServer/0/query";

export const austinSourceLinks = {
  propertyProfile: "https://www.austintexas.gov/development-services/property-profile-overview",
  geocoder: "https://maps.austintexas.gov/arcgis/rest/services/Geocode/COA_Locator/GeocodeServer",
  zoning: "https://maps.austintexas.gov/gis/rest/Shared/Zoning_1/MapServer/0",
  parcels: "https://maps.austintexas.gov/gis/rest/Shared/AppraisalDistricts/MapServer/0",
  jurisdiction: "https://maps.austintexas.gov/gis/rest/Shared/JurisdictionsFill/MapServer/0",
  femaFloodplain: "https://maps.austintexas.gov/gis/rest/Shared/Floodplain/MapServer/1",
  fullyDevelopedFloodplain: "https://maps.austintexas.gov/gis/rest/Shared/Floodplain/MapServer/0",
  floodplainGuidance: "https://www.austintexas.gov/watershed-protection/programs/floodplain-management",
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

export type EsriPolygonGeometry = {
  rings: number[][][];
  spatialReference?: Record<string, unknown>;
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
    geometry: EsriPolygonGeometry | null;
  };
  zoning: {
    zoningType: string | null;
    baseDistrict: string | null;
  };
  jurisdiction: {
    cityName: string | null;
    label: string | null;
    type: string | null;
    typeSpecifics: string | null;
  };
  flood: {
    parcelIntersectsMappedFloodplain: boolean | null;
    femaZones: string[];
    fullyDevelopedZones: string[];
    scope: "parcel_intersection";
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

function uniqueStrings(features: ArcGisFeature[] | undefined, keys: string[]) {
  const values = new Set<string>();
  for (const feature of features ?? []) {
    const value = firstString(feature.attributes, keys);
    if (value) values.add(value);
  }
  return [...values];
}

function asEsriPolygon(geometry: unknown): EsriPolygonGeometry | null {
  if (!geometry || typeof geometry !== "object") return null;
  const rings = (geometry as { rings?: unknown }).rings;
  if (!Array.isArray(rings) || rings.length === 0) return null;
  const valid = rings.every((ring) =>
    Array.isArray(ring) && ring.every((point) =>
      Array.isArray(point) && point.length >= 2 && typeof point[0] === "number" && typeof point[1] === "number",
    ),
  );
  return valid ? (geometry as EsriPolygonGeometry) : null;
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

async function pointSpatialQuery(url: string, longitude: number, latitude: number, returnGeometry = false) {
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

async function polygonSpatialQuery(url: string, polygon: EsriPolygonGeometry) {
  return fetchArcGis(url, {
    f: "json",
    geometry: JSON.stringify(polygon),
    geometryType: "esriGeometryPolygon",
    inSR: "4326",
    spatialRel: "esriSpatialRelIntersects",
    outFields: "*",
    returnGeometry: "false",
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
    pointSpatialQuery(AUSTIN_PARCELS, longitude, latitude, true),
    pointSpatialQuery(AUSTIN_ZONING, longitude, latitude),
    pointSpatialQuery(AUSTIN_JURISDICTION, longitude, latitude),
  ]);

  const parcelFeature = parcelResult.features?.[0];
  const zoningFeature = zoningResult.features?.[0];
  const jurisdictionFeature = jurisdictionResult.features?.[0];
  const parcelGeometry = asEsriPolygon(parcelFeature?.geometry);

  let femaZones: string[] = [];
  let fullyDevelopedZones: string[] = [];
  let parcelIntersectsMappedFloodplain: boolean | null = null;

  if (parcelGeometry) {
    const [femaResult, fullyDevelopedResult] = await Promise.all([
      polygonSpatialQuery(AUSTIN_FEMA_FLOODPLAIN, parcelGeometry),
      polygonSpatialQuery(AUSTIN_FULLY_DEVELOPED_FLOODPLAIN, parcelGeometry),
    ]);
    femaZones = uniqueStrings(femaResult.features, ["FLOOD_ZONE"]);
    fullyDevelopedZones = uniqueStrings(fullyDevelopedResult.features, ["FLOOD_ZONE"]);
    parcelIntersectsMappedFloodplain = femaZones.length > 0 || fullyDevelopedZones.length > 0;
  }

  return {
    provider: "city_of_austin",
    sourceType: "official_gis",
    matchedAddress: candidate.address || normalized,
    matchScore: candidate.score ?? 0,
    location: { longitude, latitude },
    parcel: {
      parcelId: firstString(parcelFeature?.attributes, ["PID_10", "PARCEL_ID", "PARCELID"]),
      propertyId: firstString(parcelFeature?.attributes, ["PROP_ID", "PROPERTY_ID", "PROPERTYID"]),
      geometry: parcelGeometry,
    },
    zoning: {
      zoningType: firstString(zoningFeature?.attributes, ["ZONING_ZTYPE", "ZONING", "ZONING_TYPE"]),
      baseDistrict: firstString(zoningFeature?.attributes, ["ZONING_BASE", "BASE_DISTRICT", "BASEZONE"]),
    },
    jurisdiction: {
      cityName: firstString(jurisdictionFeature?.attributes, ["CITY_NAME"]),
      label: firstString(jurisdictionFeature?.attributes, ["JURISDICTION_LABEL"]),
      type: firstString(jurisdictionFeature?.attributes, ["JURISDICTION_TYPE"]),
      typeSpecifics: firstString(jurisdictionFeature?.attributes, ["JURISDICTION_TYPE_SPECIFICS"]),
    },
    flood: {
      parcelIntersectsMappedFloodplain,
      femaZones,
      fullyDevelopedZones,
      scope: "parcel_intersection",
    },
    fetchedAt: new Date().toISOString(),
    sources: austinSourceLinks,
  };
}
