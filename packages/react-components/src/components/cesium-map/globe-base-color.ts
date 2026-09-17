import type { CesiumColor } from './proxied.types';

export interface IResolvedGlobeBaseColor {
  colorToApply: CesiumColor;
  defaultToStore: CesiumColor;
}

export const resolveGlobeBaseColor = (
  requestedColor: CesiumColor | undefined,
  currentColor: CesiumColor,
  storedDefault: CesiumColor | undefined
): IResolvedGlobeBaseColor => {
  const defaultToStore = storedDefault ?? currentColor.clone();
  return {
    colorToApply: requestedColor ?? defaultToStore,
    defaultToStore,
  };
};
