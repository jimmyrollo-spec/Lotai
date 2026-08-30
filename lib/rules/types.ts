export type RuleConfidence = "high" | "medium" | "review_required";
export type RuleCategory = "use" | "permit" | "setback" | "height" | "coverage" | "placement" | "constraint";

export type RuleSource = {
  id: string;
  title: string;
  authority: string;
  url: string;
  locator?: string;
  effectiveDate?: string | null;
  lastVerified: string;
};

export type RuleApplicability = {
  baseZoning?: string[];
  projectTypes?: string[];
  maxAreaSqFt?: number;
  maxHeightFt?: number;
  maxStories?: number;
  requiresNoPlumbing?: boolean;
  requiresNoDwellingUse?: boolean;
  excludesFloodHazard?: boolean;
  principalUses?: string[];
  notes?: string[];
};

export type NormalizedRule = {
  id: string;
  jurisdictionKey: string;
  projectType: string;
  category: RuleCategory;
  label: string;
  explanation: string;
  normalizedValue?: number | string | boolean | null;
  unit?: "ft" | "sq_ft" | "percent" | "count" | "boolean" | null;
  applicability: RuleApplicability;
  sourceIds: string[];
  confidence: RuleConfidence;
  automation: "eligible" | "partial" | "manual_review";
  unresolved?: string[];
};

export type JurisdictionRulePack = {
  schemaVersion: 1;
  jurisdictionKey: string;
  jurisdictionName: string;
  projectType: string;
  status: "research" | "verified_seed" | "production";
  verifiedAt: string;
  sources: RuleSource[];
  rules: NormalizedRule[];
};
