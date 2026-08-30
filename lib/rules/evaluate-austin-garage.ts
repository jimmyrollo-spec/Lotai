export type AustinGarageIntendedUse = "vehicle_storage" | "workshop_storage" | "habitable" | "unsure";
export type AustinGaragePlacement = "rear" | "side" | "front" | "unsure";

export type AustinGarageInputs = {
  widthFt: number | null;
  depthFt: number | null;
  heightFt: number | null;
  stories: number | null;
  plumbing: "yes" | "no" | "unsure";
  intendedUse: AustinGarageIntendedUse;
  placement: AustinGaragePlacement;
  baseZoning: string | null;
  floodIntersectsMappedFloodplain: boolean | null;
  parcelAreaSqFt: number | null;
  existingBuildingAreaSqFt: number | null;
  existingBuildingCoveragePct: number | null;
  existingImperviousAreaSqFt: number | null;
  existingImperviousCoveragePct: number | null;
};

export type AustinGarageRuleFact = {
  id: string;
  label: string;
  value: string;
  tone: "positive" | "warning" | "neutral";
  explanation: string;
  sourceLabel: string;
  sourceUrl: string;
};

const WORK_EXEMPT_URL = "https://www.austintexas.gov/development-services/work-exempt-building-permits";
const DISTRICT_RULES_URL = "https://library.municode.com/tx/austin/codes/land_development_code?nodeId=TIT25LADE_CH25-2ZO_SUBCHAPTER_CUSDERE_ART3ADRECEDI";
const SITE_DEVELOPMENT_URL = "https://library.municode.com/tx/austin/codes/land_development_code?nodeId=TIT25LADE_CH25-2ZO_SUBCHAPTER_CUSDERE_ART2PRUSDERE_DIV1RETA_S25-2-492SIDERE";
const GARAGE_PLACEMENT_URL = "https://library.municode.com/tx/austin/codes/code_of_ordinances/469236?nodeId=TIT25LADE_CH25-2ZO_SUBCHAPTER_CUSDERE_ART4ADRECEUS_DIV2COUS_S25-2-815LAREUS";
const FLOODPLAIN_GUIDANCE_URL = "https://www.austintexas.gov/watershed-protection/programs/floodplain-management";
const HOME_AMENDMENTS_URL = "https://www.austintexas.gov/development-services/home-amendments";
const PLANIMETRICS_URL = "https://maps.austintexas.gov/arcgis/rest/services/Shared/PlanimetricsSurvey_1/MapServer";

const singleFamilyBaseStandards = {
  "SF-1": { front: 25, streetSide: 15, interiorSide: 5, rear: 10, buildingCover: 35, imperviousCover: 40 },
  "SF-2": { front: 25, streetSide: 15, interiorSide: 5, rear: 10, buildingCover: 40, imperviousCover: 45 },
  "SF-3": { front: 25, streetSide: 15, interiorSide: 5, rear: 10, buildingCover: 40, imperviousCover: 45 },
} as const;

function cleanBaseZoning(value: string | null) {
  if (!value) return null;
  const match = value.toUpperCase().match(/\b(SF-[123])\b/);
  return match?.[1] as keyof typeof singleFamilyBaseStandards | undefined ?? null;
}

function exemptionUseState(intendedUse: AustinGarageIntendedUse) {
  if (intendedUse === "habitable") return "fails" as const;
  if (intendedUse === "vehicle_storage" || intendedUse === "workshop_storage") return "passes" as const;
  return "unresolved" as const;
}

function oneDecimal(value: number) {
  return value.toFixed(1);
}

function projectedCoverage(existingAreaSqFt: number | null, proposedAreaSqFt: number | null, parcelAreaSqFt: number | null) {
  if (existingAreaSqFt === null || proposedAreaSqFt === null || parcelAreaSqFt === null || parcelAreaSqFt <= 0) return null;
  return ((existingAreaSqFt + proposedAreaSqFt) / parcelAreaSqFt) * 100;
}

export function evaluateAustinGarageFacts(inputs: AustinGarageInputs): AustinGarageRuleFact[] {
  const facts: AustinGarageRuleFact[] = [];
  const area = inputs.widthFt && inputs.depthFt ? inputs.widthFt * inputs.depthFt : null;
  const baseZoning = cleanBaseZoning(inputs.baseZoning);
  const baseStandards = baseZoning ? singleFamilyBaseStandards[baseZoning] : null;

  if (inputs.floodIntersectsMappedFloodplain === true) {
    facts.push({
      id: "parcel-floodplain-intersection",
      label: "Mapped floodplain intersection",
      value: "Parcel intersection detected",
      tone: "warning",
      explanation: "The official City of Austin floodplain query intersects the parcel polygon. This is a parcel-level screening result, not proof that the proposed garage footprint is inside the floodplain. Exact placement and floodplain requirements need review before using any small-structure permit exemption or making a siting decision.",
      sourceLabel: "City of Austin · Floodplain Management / GIS",
      sourceUrl: FLOODPLAIN_GUIDANCE_URL,
    });
  } else if (inputs.floodIntersectsMappedFloodplain === false) {
    facts.push({
      id: "parcel-floodplain-intersection",
      label: "Mapped floodplain intersection",
      value: "No parcel intersection detected",
      tone: "positive",
      explanation: "The parcel polygon did not intersect the City of Austin FEMA or fully-developed floodplain layers queried by this beta check. This supports the mapped-floodplain condition of the small-structure exemption, but it does not replace a survey, elevation determination or City review where otherwise required.",
      sourceLabel: "City of Austin · Floodplain Management / GIS",
      sourceUrl: FLOODPLAIN_GUIDANCE_URL,
    });
  } else {
    facts.push({
      id: "parcel-floodplain-intersection",
      label: "Mapped floodplain intersection",
      value: "Not resolved",
      tone: "neutral",
      explanation: "The parcel geometry or floodplain query was not available, so the flood-hazard condition remains unresolved rather than being assumed clear.",
      sourceLabel: "City of Austin · Floodplain Management / GIS",
      sourceUrl: FLOODPLAIN_GUIDANCE_URL,
    });
  }

  if (baseZoning && baseStandards) {
    facts.push({
      id: "base-yard-setbacks",
      label: `${baseZoning} base yard setbacks`,
      value: `Front ${baseStandards.front} ft · side ${baseStandards.interiorSide} ft · street side ${baseStandards.streetSide} ft · rear ${baseStandards.rear} ft`,
      tone: "neutral",
      explanation: `These are the current base-district site-development standards shown for ${baseZoning}. More specific rules can supersede them, including the five-foot rear-yard rule for a qualifying low accessory building. A corner lot, overlay, easement or garage-placement rule can also change what controls at the proposed location.`,
      sourceLabel: "Austin LDC · § 25-2-492 Site Development Regulations",
      sourceUrl: SITE_DEVELOPMENT_URL,
    });

    const projectedBuildingCoverage = projectedCoverage(inputs.existingBuildingAreaSqFt, area, inputs.parcelAreaSqFt);
    if (inputs.existingBuildingCoveragePct !== null) {
      const projectedIsOver = projectedBuildingCoverage !== null && projectedBuildingCoverage > baseStandards.buildingCover;
      facts.push({
        id: "mapped-building-cover",
        label: `${baseZoning} mapped building-coverage check`,
        value: projectedBuildingCoverage === null
          ? `${oneDecimal(inputs.existingBuildingCoveragePct)}% mapped existing · ${baseStandards.buildingCover}% base limit`
          : `${oneDecimal(inputs.existingBuildingCoveragePct)}% existing → ${oneDecimal(projectedBuildingCoverage)}% with proposed footprint · ${baseStandards.buildingCover}% base limit`,
        tone: projectedBuildingCoverage === null ? "neutral" : projectedIsOver ? "warning" : "positive",
        explanation: projectedBuildingCoverage === null
          ? `The 2023 Austin building-footprint layer, clipped to the mapped parcel and measured by the City GeometryServer, indicates approximately ${oneDecimal(inputs.existingBuildingCoveragePct)}% mapped building footprint. The project footprint is not complete enough to add a scenario yet. This is a derived screening metric, not a survey or official development-review calculation.`
          : `The 2023 Austin building-footprint layer indicates approximately ${oneDecimal(inputs.existingBuildingCoveragePct)}% mapped existing building footprint. Adding the proposed ${Math.round(area ?? 0).toLocaleString()} sq ft detached-garage footprint produces a mapped-footprint scenario of approximately ${oneDecimal(projectedBuildingCoverage)}%. ${projectedIsOver ? "That exceeds the base-district percentage and is a material constraint requiring confirmation." : "That remains below the base-district percentage in this mapped screening calculation."} Regulatory building-cover definitions, source vintage, demolitions and survey geometry can change the official result.`,
        sourceLabel: "Austin LDC § 25-2-492 + 2023 Building Footprints",
        sourceUrl: PLANIMETRICS_URL,
      });
    } else {
      facts.push({
        id: "base-building-cover-limit",
        label: `${baseZoning} maximum building coverage`,
        value: `${baseStandards.buildingCover}% · mapped site percentage unavailable`,
        tone: "neutral",
        explanation: `The current base-district table lists a maximum building coverage of ${baseStandards.buildingCover}% for ${baseZoning}. Austin states garages and carports continue to count toward building coverage. The mapped coverage calculation was unavailable, so the limit remains unresolved rather than estimated.`,
        sourceLabel: "Austin LDC § 25-2-492 + HOME Amendments",
        sourceUrl: HOME_AMENDMENTS_URL,
      });
    }

    if (inputs.existingImperviousCoveragePct !== null) {
      const fullyNewScenario = projectedCoverage(inputs.existingImperviousAreaSqFt, area, inputs.parcelAreaSqFt);
      const existingIsOver = inputs.existingImperviousCoveragePct > baseStandards.imperviousCover;
      facts.push({
        id: "mapped-impervious-cover",
        label: `${baseZoning} mapped impervious-cover screening`,
        value: fullyNewScenario === null
          ? `${oneDecimal(inputs.existingImperviousCoveragePct)}% mapped existing · ${baseStandards.imperviousCover}% base limit`
          : `${oneDecimal(inputs.existingImperviousCoveragePct)}% existing · up to ${oneDecimal(fullyNewScenario)}% if footprint is entirely new impervious · ${baseStandards.imperviousCover}% base limit`,
        tone: existingIsOver ? "warning" : "neutral",
        explanation: `Austin's 2023 impervious-cover polygons, clipped and unioned within the mapped parcel, indicate approximately ${oneDecimal(inputs.existingImperviousCoveragePct)}% mapped impervious cover. ${fullyNewScenario !== null ? `If every square foot of the proposed garage footprint were new impervious area, the screening scenario would be approximately ${oneDecimal(fullyNewScenario)}%. The actual increase can be lower where the garage overlaps an existing driveway or other mapped impervious area, so this is not yet a project pass/fail.` : "The project footprint is not complete enough to calculate a scenario."} Source vintage and regulatory definitions still require confirmation.`,
        sourceLabel: "Austin LDC § 25-2-492 + 2023 Impervious Cover",
        sourceUrl: PLANIMETRICS_URL,
      });
    } else {
      facts.push({
        id: "base-impervious-cover-limit",
        label: `${baseZoning} maximum impervious cover`,
        value: `${baseStandards.imperviousCover}% · mapped site percentage unavailable`,
        tone: "neutral",
        explanation: `The current base-district table lists a maximum impervious cover of ${baseStandards.imperviousCover}% for ${baseZoning}. Austin's current HOME guidance confirms garages and carports count toward impervious cover. The mapped site percentage could not be calculated, so it remains unresolved.`,
        sourceLabel: "Austin LDC § 25-2-492 + HOME Amendments",
        sourceUrl: HOME_AMENDMENTS_URL,
      });
    }
  }

  if (area !== null) {
    const heightState = inputs.heightFt === null ? "unresolved" : inputs.heightFt <= 15 ? "passes" : "fails";
    const storyState = inputs.stories === null ? "unresolved" : inputs.stories <= 1 ? "passes" : "fails";
    const plumbingState = inputs.plumbing === "unsure" ? "unresolved" : inputs.plumbing === "no" ? "passes" : "fails";
    const useState = exemptionUseState(inputs.intendedUse);
    const floodState = inputs.floodIntersectsMappedFloodplain === null
      ? "unresolved"
      : inputs.floodIntersectsMappedFloodplain
        ? "fails"
        : "passes";

    if (area > 200) {
      facts.push({
        id: "permit-exemption-area",
        label: "Small detached-structure permit exemption",
        value: "200 sq ft exemption threshold exceeded",
        tone: "warning",
        explanation: `The proposed footprint is approximately ${Math.round(area).toLocaleString()} sq ft. Austin's listed residential building-permit exemption for a detached accessory structure is limited to structures no larger than 200 sq ft and also has height, plumbing, dwelling-use and flood-hazard conditions. This specific exemption cannot apply based on area alone; that is not itself a complete permit-path determination.`,
        sourceLabel: "City of Austin · Work Exempt from Building Permits",
        sourceUrl: WORK_EXEMPT_URL,
      });
    } else {
      const states = [heightState, storyState, plumbingState, useState, floodState];
      const anyFail = states.includes("fails");
      const anyUnresolved = states.includes("unresolved");
      const listedConditionsAppearSatisfied = !anyFail && !anyUnresolved;

      let value = "Additional exemption conditions unresolved";
      let tone: AustinGarageRuleFact["tone"] = "neutral";

      if (useState === "fails") {
        value = "Dwelling-use condition not satisfied";
        tone = "warning";
      } else if (plumbingState === "fails") {
        value = "No-plumbing condition not satisfied";
        tone = "warning";
      } else if (heightState === "fails" || storyState === "fails") {
        value = "Height / one-story condition not satisfied";
        tone = "warning";
      } else if (floodState === "fails") {
        value = "Mapped floodplain condition not satisfied at parcel-screening level";
        tone = "warning";
      } else if (listedConditionsAppearSatisfied) {
        value = "Listed exemption conditions appear satisfied from current inputs";
        tone = "positive";
      }

      facts.push({
        id: "permit-exemption-area",
        label: "Small detached-structure building-permit exemption",
        value,
        tone,
        explanation: listedConditionsAppearSatisfied
          ? "Based on the supplied dimensions and use, the structure is no larger than 200 sq ft, no more than one story / 15 ft, has no planned plumbing or dwelling use, and the parcel did not intersect the queried Austin floodplain layers. Those listed conditions appear satisfied. This is not an authorization to build and does not resolve electrical permits, other trade permits, zoning/site standards, overlays, easements or other applicable approvals."
          : "Austin lists an exemption for qualifying one-story detached accessory structures no larger than 200 sq ft and 15 ft high, with no dwelling use or plumbing, and outside a flood hazard area. The beta check only resolves conditions supported by the supplied project scope and mapped parcel data; failed or unknown conditions remain visible rather than being assumed away.",
        sourceLabel: "City of Austin · Work Exempt from Building Permits",
        sourceUrl: WORK_EXEMPT_URL,
      });
    }
  }

  if (baseZoning && inputs.heightFt !== null && inputs.stories !== null) {
    if (inputs.heightFt <= 15 && inputs.stories <= 1) {
      facts.push({
        id: "rear-setback-sf1-sf3",
        label: "Rear setback for qualifying low accessory building",
        value: "5 ft",
        tone: inputs.placement === "rear" ? "positive" : "neutral",
        explanation: `The mapped base zoning appears to include ${baseZoning}. For SF-1, SF-2 and SF-3, Austin's district regulations state a five-foot rear-yard setback for an accessory building no more than one story or 15 ft high. ${inputs.placement === "rear" ? "The proposed placement is rear yard, so this is directly relevant." : "The proposed placement is not currently marked rear yard, so this is retained as a property rule rather than a project pass/fail."} Easements and overlays still need separate review.`,
        sourceLabel: "Austin LDC · §§ 25-2-553 through 25-2-555",
        sourceUrl: DISTRICT_RULES_URL,
      });
    } else {
      facts.push({
        id: "rear-setback-sf1-sf3",
        label: "Rear setback",
        value: "Low-accessory exception not automatically applicable",
        tone: "warning",
        explanation: `The mapped base zoning appears to include ${baseZoning}, but the proposed height/story count is outside the one-story / 15-ft condition for the five-foot accessory-building rear-setback rule. The otherwise applicable setback must be resolved before a conclusion is shown.`,
        sourceLabel: "Austin LDC · §§ 25-2-553 through 25-2-555",
        sourceUrl: DISTRICT_RULES_URL,
      });
    }
  }

  facts.push({
    id: "garage-placement",
    label: "Garage placement relative to the street-facing façade",
    value: inputs.placement === "front" ? "Front placement requires geometry check" : "Rule known · site geometry still required",
    tone: "warning",
    explanation: "Austin's garage-placement rule says a parking structure may not be closer to the front lot line than the front-most first-floor building façade. It also adds a width condition when a front-facing garage entrance is less than 20 ft behind that façade. The 2026 City interpretation is current, but the beta does not yet have the façade/front-lot-line geometry needed to apply the rule automatically.",
    sourceLabel: "Austin LDC · Garage Placement + CI2026-0001",
    sourceUrl: GARAGE_PLACEMENT_URL,
  });

  return facts;
}
