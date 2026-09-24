export const requiresWorldwideTransparentLayer = (realBaseLayerCount: number): boolean =>
  realBaseLayerCount === 0;

export const shouldRemoveTransparentLayerOnOptimizationDisable = (
  requiresTransparentLayerIndependently: boolean
): boolean => !requiresTransparentLayerIndependently;
