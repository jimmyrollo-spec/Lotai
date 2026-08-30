export type AustinGarageIntendedUse = "vehicle_storage" | "workshop_storage" | "habitable" | "unsure";

export type AustinGarageInputs = {
  widthFt: number | null;
  depthFt: number | null;
  heightFt: number | null;
  stories: number | null;
  plumbing: "yes" | "no" | "unsure";
  intendedUse: AustinGarageIntendedUse;
  baseZoning: string | null;
  floodIntersectsMappedFloodplain: boolean | null;
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
const GARAGE_INTERPRETATIONS_URL = "https://www.austintexas.gov/development-services/code-interpretations";
const FLOODPLAIN_GUIDANCE_URL = "https://www.austintexas.gov/watershed-protection/programs/floodplain-management";

function cleanBaseZoning(value: string | null) {
  if (!value) return null;
  const match = value.toUpperCase().match(/\b(SF-[123])\b/);
  return match?.[1] ?? null;
}

function exemptionUseState(intendedUse: AustinGarageIntendedUse) {
  if (intendedUse === "habitable") return "fails" as const;
  if (intendedUse === "vehicle_storage" || intendedUse === "workshop_storage") return "passes" as const;
  return "unresolved" as const;
}

export function evaluateAustinGarageFacts(inputs: AustinGarageInputs): AustinGarageRuleFact[] {
  const facts: AustinGarageRuleFact[] = [];
  const area = inputs.widthFt && inputs.depthFt ? inputs.widthFt * inputs.depthFt : null;
  const baseZoning = cleanBaseZoning(inputs.baseZoning);

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
        tone: "positive",
        explanation: `The mapped base zoning appears to include ${baseZoning}. For SF-1, SF-2 and SF-3, Austin's district regulations state a five-foot rear-yard setback for an accessory building no more than one story or 15 ft high. Easements, overlays and other site conditions still need separate review.`,
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
    id: "garage-placement-interpretation",
    label: "Garage placement relative to the street-facing façade",
    value: "Manual review required",
    tone: "warning",
    explanation: "Austin posted an updated 2026 code interpretation specifically for parking-structure / garage placement. We are keeping this check unresolved until the interpretation and the property's exact placement/orientation can be applied deterministically.",
    sourceLabel: "City of Austin · CI2026-0001 Garage Placement",
    sourceUrl: GARAGE_INTERPRETATIONS_URL,
  });

  return facts;
}
