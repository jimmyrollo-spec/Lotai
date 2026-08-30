export type ProjectKey = "garage" | "deck" | "shed" | "pool" | "addition";

export type ProjectDefinition = {
  key: ProjectKey;
  label: string;
  shortLabel: string;
  description: string;
  example: string;
};

export const projectDefinitions: ProjectDefinition[] = [
  {
    key: "garage",
    label: "Detached garage / workshop",
    shortLabel: "Garage",
    description: "Check accessory-structure rules, setbacks, lot coverage, height and permit triggers.",
    example: "24 × 30 ft detached garage",
  },
  {
    key: "deck",
    label: "Deck",
    shortLabel: "Deck",
    description: "Check permit thresholds, setbacks, height and project-specific construction constraints.",
    example: "16 × 20 ft raised deck",
  },
  {
    key: "shed",
    label: "Shed / accessory structure",
    shortLabel: "Shed",
    description: "Check size thresholds, placement, setbacks, height and when permits are required.",
    example: "12 × 16 ft backyard shed",
  },
  {
    key: "pool",
    label: "Pool",
    shortLabel: "Pool",
    description: "Check property-line setbacks, barriers, equipment placement and permitting path.",
    example: "16 × 32 ft in-ground pool",
  },
  {
    key: "addition",
    label: "Home addition",
    shortLabel: "Addition",
    description: "Check zoning envelope, lot coverage, setbacks, height and likely approvals.",
    example: "18 ft rear addition",
  },
];

export const demoResult = {
  confidence: 86,
  status: "Likely feasible",
  statusTone: "positive" as const,
  parcel: {
    lotArea: "7,840 sq ft",
    frontage: "56 ft",
    depth: "140 ft",
    zoning: "Residential — demo",
    jurisdiction: "Prototype jurisdiction",
  },
  checks: [
    { label: "Project type allowed", value: "Appears allowed", tone: "positive" },
    { label: "Rear setback", value: "5 ft", tone: "neutral" },
    { label: "Side setback", value: "5 ft", tone: "neutral" },
    { label: "Max accessory height", value: "16 ft", tone: "neutral" },
    { label: "Estimated lot coverage", value: "29% after project", tone: "positive" },
    { label: "Building permit", value: "Likely required", tone: "warning" },
  ],
  constraints: [
    "A mapped utility/easement layer has not yet been connected in prototype mode.",
    "Exact structure placement requires confirmation against the authoritative parcel boundary.",
  ],
  nextSteps: [
    "Confirm parcel and zoning designation from authoritative jurisdiction data.",
    "Verify setbacks and lot-coverage calculation using the effective municipal code.",
    "Check easements, overlays and utility constraints before final placement.",
    "Confirm permit submittal requirements with the authority having jurisdiction.",
  ],
};
