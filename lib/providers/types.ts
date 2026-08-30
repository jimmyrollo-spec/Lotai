export type PropertyProviderDescriptor = {
  key: string;
  marketLabel: string;
  jurisdictionKey: string;
  authority: string;
};

export type PropertyLookupProvider<TResult> = PropertyProviderDescriptor & {
  lookup(address: string): Promise<TResult | null>;
};
