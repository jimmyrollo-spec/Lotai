import { lookupAustinProperty, type AustinPropertyMatch } from "@/lib/providers/austin";
import type { PropertyLookupProvider } from "@/lib/providers/types";

export const austinPropertyProvider: PropertyLookupProvider<AustinPropertyMatch> = {
  key: "city_of_austin",
  marketLabel: "Austin, Texas",
  jurisdictionKey: "us-tx-austin",
  authority: "City of Austin",
  lookup: lookupAustinProperty,
};

export const propertyProviders = [austinPropertyProvider] as const;
