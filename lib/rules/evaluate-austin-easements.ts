import type { AustinEasementScreen } from "@/lib/providers/austin-easements";
import type { AustinGarageRuleFact } from "@/lib/rules/evaluate-austin-garage";

const EASEMENT_SOURCE = "https://maps.austintexas.gov/gis/rest/Shared/Property/MapServer/4";

export function evaluateAustinEasementFact(screen: AustinEasementScreen | null): AustinGarageRuleFact {
  if (!screen) {
    return {
      id: "mapped-easement-screen",
      label: "Mapped easement screening",
      value: "Source unavailable",
      tone: "neutral",
      explanation: "The City easement layer could not be screened for this request, so easement status remains unresolved. A survey, title work and City / county records may still be needed before siting a project.",
      sourceLabel: "City of Austin · Easement Polygons",
      sourceUrl: EASEMENT_SOURCE,
    };
  }

  if (screen.potentiallyActiveCount > 0) {
    const uses = screen.uses.slice(0, 4).join(", ");
    return {
      id: "mapped-easement-screen",
      label: "Mapped easement screening",
      value: `${screen.potentiallyActiveCount} potentially active mapped record${screen.potentiallyActiveCount === 1 ? "" : "s"}`,
      tone: "warning",
      explanation: `The City of Austin easement layer returns ${screen.potentiallyActiveCount} parcel-intersecting record${screen.potentiallyActiveCount === 1 ? "" : "s"} not marked RELEASED.${uses ? ` Mapped use${screen.uses.length === 1 ? "" : "s"}: ${uses}.` : ""} The proposed garage footprint must be checked against the actual easement geometry and governing document. Austin also warns that not all easements are mapped, so this layer is a screening source rather than complete title evidence.`,
      sourceLabel: "City of Austin · Easement Polygons",
      sourceUrl: EASEMENT_SOURCE,
    };
  }

  return {
    id: "mapped-easement-screen",
    label: "Mapped easement screening",
    value: screen.releasedCount > 0 ? "No potentially active mapped polygon · released record(s) present" : "No potentially active mapped polygon returned",
    tone: "neutral",
    explanation: "No parcel-intersecting easement polygon not marked RELEASED was returned by the current City layer. This is not a clearance: Austin explicitly notes that not all easements for a property have been mapped. A current survey, title work and underlying recorded documents can still reveal constraints.",
    sourceLabel: "City of Austin · Easement Polygons",
    sourceUrl: EASEMENT_SOURCE,
  };
}
