export type CoverageMetrics = {
  carbonComponents: number;
  carbonTextStyles: number;
  carbonColorStyles: number;
  // carbonEffectStyles: number;
  nonCarbonComponents: number;
  nonCarbonComponentList: any[];
  nonCarbonTextStyles: number;
  nonCarbonColorStyles: number;
  // nonCarbonEffectStyles: number;
  totalLayers: number;
  carbonCoverage: number;
};

export enum ClientStorageEventTypes {
  LoadIgnoredItems = "clientStorage__ignoredItems__load",
  AddIgnoredItems = "clientStorage__ignoredItems__add",
  RemoveIgnoredItems = "clientStorage__ignoredItems__remove",
  UpdateIgnoredItems = "clientStorage__ignoredItems__update",
}

export enum nonCarbonErrorTypes {
  OverriddenCarbonInstance = "OverriddenCarbonInstance",
  NotCarbonText = "NotCarbonText",
  NotCarbonTextStyle = "NotCarbonTextStyle",
  NotCarbonTextColor = "NotCarbonTextColor",
  NotCarbonTextRangeColor = "NotCarbonTextRangeColor",
  NotCarbonBoxBorderColor = "NotCarbonBoxBorderColor",
  NotCarbonBoxBackgroundColor = "NotCarbonBoxBackgroundColor",
  NotCreatedUsingCarbonComponentsOrTokens = "NotCreatedUsingCarbonComponentsOrTokens",
}
export enum nonCarbonErrorMessages {
  OverriddenCarbonInstance = "Carbon v11 component is overridden",
  NotCarbonText = "Text is not using Carbon v11 tokens",
  NotCarbonTextStyle = "Text style is not from Carbon v11",
  NotCarbonTextColor = "Text color is not from Carbon v11",
  NotCarbonTextRangeColor = "Text color is not from Carbon v11",
  NotCarbonBoxBorderColor = "Border color is not from Carbon v11",
  NotCarbonBoxBackgroundColor = "Background color is not from Carbon v11",
  NotCreatedUsingCarbonComponentsOrTokens = "Not created using Carbon components or tokens",
}

export const colorErrorCodes: (keyof typeof nonCarbonErrorMessages)[] = [
  "NotCarbonTextColor",
  "NotCarbonTextRangeColor",
  "NotCarbonBoxBorderColor",
  "NotCarbonBoxBackgroundColor",
];

export const typeErrorCodes: (keyof typeof nonCarbonErrorMessages)[] = [
  "NotCarbonTextStyle",
];

export const componentErrorCodes: (keyof typeof nonCarbonErrorMessages)[] = [
  "OverriddenCarbonInstance",
  "NotCreatedUsingCarbonComponentsOrTokens",
];

export const effectErrorCodes: (keyof typeof nonCarbonErrorMessages)[] = [];

export type IgnoredItem = {
  id: string;
  code: string;
};
