const AUSTIN_PERMITS_API = "https://data.austintexas.gov/resource/3syk-w9eu.json";

export const austinPermitSource = {
  dataset: "https://data.austintexas.gov/Building-and-Development/Issued-Construction-Permits/3syk-w9eu",
  api: AUSTIN_PERMITS_API,
  authority: "City of Austin Development Services",
  updateFrequency: "Daily",
} as const;

type SocrataLink = { url?: string };

type AustinPermitApiRow = {
  permittype?: string;
  permit_type_desc?: string;
  permit_number?: string;
  permit_class_mapped?: string;
  permit_class?: string;
  work_class?: string;
  description?: string;
  tcad_id?: string;
  applieddate?: string;
  issue_date?: string;
  status_current?: string;
  statusdate?: string;
  expiresdate?: string;
  completed_date?: string;
  total_existing_bldg_sqft?: string;
  remodel_repair_sqft?: string;
  total_new_add_sqft?: string;
  total_job_valuation?: string;
  original_address1?: string;
  link?: SocrataLink;
};

export type AustinPermitRecord = {
  permitNumber: string;
  permitTypeCode: string | null;
  permitType: string | null;
  permitClassMapped: string | null;
  permitClass: string | null;
  workClass: string | null;
  description: string | null;
  tcadId: string;
  appliedDate: string | null;
  issueDate: string | null;
  status: string | null;
  statusDate: string | null;
  expiresDate: string | null;
  completedDate: string | null;
  existingBuildingSqFt: number | null;
  remodelRepairSqFt: number | null;
  newAddSqFt: number | null;
  jobValuation: number | null;
  address: string | null;
  officialLink: string | null;
};

export type AustinPermitHistory = {
  tcadId: string;
  records: AustinPermitRecord[];
  fetchedAt: string;
  source: typeof austinPermitSource;
  scope: "tcad_id_match";
  disclaimer: string;
};

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function numberOrNull(value: unknown) {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function safeTcadId(value: string) {
  const cleaned = value.trim().replace(/[^0-9]/g, "");
  return cleaned.length >= 6 ? cleaned : null;
}

export async function lookupAustinPermitHistory(tcadId: string, limit = 20): Promise<AustinPermitHistory | null> {
  const safeId = safeTcadId(tcadId);
  if (!safeId) return null;

  const safeLimit = Math.max(1, Math.min(50, Math.floor(limit)));
  const query = new URLSearchParams({
    "$select": [
      "permittype",
      "permit_type_desc",
      "permit_number",
      "permit_class_mapped",
      "permit_class",
      "work_class",
      "description",
      "tcad_id",
      "applieddate",
      "issue_date",
      "status_current",
      "statusdate",
      "expiresdate",
      "completed_date",
      "total_existing_bldg_sqft",
      "remodel_repair_sqft",
      "total_new_add_sqft",
      "total_job_valuation",
      "original_address1",
      "link",
    ].join(","),
    "$where": `tcad_id='${safeId}'`,
    "$order": "issue_date DESC",
    "$limit": String(safeLimit),
  });

  const response = await fetch(`${AUSTIN_PERMITS_API}?${query.toString()}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 60 * 60 * 6 },
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) throw new Error(`Austin permit history request failed with ${response.status}`);
  const rows = (await response.json()) as AustinPermitApiRow[];
  if (!Array.isArray(rows)) throw new Error("Austin permit history returned an invalid response");

  const records = rows
    .filter((row) => text(row.permit_number))
    .map((row): AustinPermitRecord => ({
      permitNumber: text(row.permit_number)!,
      permitTypeCode: text(row.permittype),
      permitType: text(row.permit_type_desc),
      permitClassMapped: text(row.permit_class_mapped),
      permitClass: text(row.permit_class),
      workClass: text(row.work_class),
      description: text(row.description),
      tcadId: safeId,
      appliedDate: text(row.applieddate),
      issueDate: text(row.issue_date),
      status: text(row.status_current),
      statusDate: text(row.statusdate),
      expiresDate: text(row.expiresdate),
      completedDate: text(row.completed_date),
      existingBuildingSqFt: numberOrNull(row.total_existing_bldg_sqft),
      remodelRepairSqFt: numberOrNull(row.remodel_repair_sqft),
      newAddSqFt: numberOrNull(row.total_new_add_sqft),
      jobValuation: numberOrNull(row.total_job_valuation),
      address: text(row.original_address1),
      officialLink: text(row.link?.url),
    }));

  return {
    tcadId: safeId,
    records,
    fetchedAt: new Date().toISOString(),
    source: austinPermitSource,
    scope: "tcad_id_match",
    disclaimer: "Austin Development Services states that this open dataset is informational, continuously updated, and may differ from official department data. A missing record should not be treated as proof that no permit exists.",
  };
}
