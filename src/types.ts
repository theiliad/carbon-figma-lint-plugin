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
  NotCarbonInstance = "NotCarbonInstance",
  NotCarbonText = "NotCarbonText",
  NotCarbonTextStyle = "NotCarbonTextStyle",
  NotCarbonTextColor = "NotCarbonTextColor",
  NotCarbonTextRangeColor = "NotCarbonTextRangeColor",
  NotCarbonBox = "NotCarbonBox",
  NotCarbonBoxBorderColor = "NotCarbonBoxBorderColor",
  NotCarbonBoxBackgroundColor = "NotCarbonBoxBackgroundColor",
  NotCarbonComponent = "NotCarbonComponent",
  NotCarbonDivider = "NotCarbonDivider",
  NotCarbonElevation = "NotCarbonElevation",
  NotCreatedUsingCarbonComponentsOrTokens = "NotCreatedUsingCarbonComponentsOrTokens",
}
export enum nonCarbonErrorMessages {
  OverriddenCarbonInstance = "Overridden Carbon Instance. Please reset changes",
  NotCarbonInstance = "Instance is not a Carbon Instance",
  NotCarbonText = "Text is not using Carbon",
  NotCarbonTextStyle = "Text Style is not using Carbon",
  NotCarbonTextColor = "Text Color Style should only use Carbon tokens",
  NotCarbonTextRangeColor = "Text Color Style should only use Carbon tokens",
  NotCarbonBox = "Box not adhering to Carbon guidelines",
  NotCarbonBoxBorderColor = "Box Border color should only use Carbon tokens",
  NotCarbonBoxBackgroundColor = "Box Background color should only use Carbon tokens",
  NotCarbonComponent = "Use relevant Carbon component",
  NotCarbonDivider = "Use a Divider Component Instead",
  NotCarbonElevation = "Effects not from Carbon's elevation styles",
  NotCreatedUsingCarbonComponentsOrTokens = "Not created using Carbon components or tokens",
}

export type IgnoredItem = {
  id: string;
  code: string;
};
