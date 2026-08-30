export type AustinGarageInputs = {
  widthFt: number | null;
  depthFt: number | null;
  heightFt: number | null;
  stories: number | null;
  plumbing: "yes" | "no" | "unsure";
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
    if (area > 200) {
      facts.push({
        id: "permit-exemption-area",
        label: "Small detached-structure permit exemption",
        value: "200 sq ft exemption threshold exceeded",
        tone: "warning",
        explanation: `The proposed footprint is approximately ${Math.round(area).toLocaleString()} sq ft. Austin's listed residential building-permit exemption for a detached accessory structure is limited to structures no larger than 200 sq ft and also has height, plumbing, dwelling-use and flood-hazard conditions. This means that specific exemption does not apply based on area alone; it is not itself a final permit determination.`,
        sourceLabel: "City of Austin · Work Exempt from Building Permits",
        sourceUrl: WORK_EXEMPT_URL,
      });
    } else {
      const knownHeightPass = inputs.heightFt !== null && inputs.heightFt <= 15;
      const knownStoryPass = inputs.stories !== null && inputs.stories <= 1;
      const knownPlumbingPass = inputs.plumbing === "no";
      const knownFloodPass = inputs.floodIntersectsMappedFloodplain === false;
      const floodFails = inputs.floodIntersectsMappedFloodplain === true;
      const knownConditionsPass = knownHeightPass && knownStoryPass && knownPlumbingPass && knownFloodPass;

      facts.push({
        id: "permit-exemption-area",
        label: "Small detached-structure permit exemption",
        value: floodFails
          ? "Mapped floodplain condition not satisfied at parcel-screening level"
          : knownConditionsPass
            ? "Several listed conditions appear satisfied · dwelling use still must be confirmed"
            : "Additional exemption conditions unresolved",
        tone: floodFails || knownConditionsPass ? "warning" : "neutral",
        explanation: "Austin lists an exemption for qualifying one-story detached accessory structures no larger than 200 sq ft and 15 ft high, with no dwelling use or plumbing, and outside a flood hazard area. This beta check resolves only conditions supported by the project inputs and mapped parcel/flood data; it does not mark a structure permit-exempt until every condition is confirmed.",
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
