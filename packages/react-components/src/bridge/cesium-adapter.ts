import type { RCesiumWMTSLayerOptions } from '../components/cesium-map/layers/wmts.layer';
import type { RCesiumWMSLayerOptions } from '../components/cesium-map/layers/wms.layer';
import type { RCesiumXYZLayerOptions } from '../components/cesium-map/layers/xyz.layer';
import type { LayerType, MCOptions } from '../components/cesium-map/layers-manager';
import { ProtocolType } from '../components/models/protocol-type.enum';
import { toWmsConstructorOptions, toWmtsConstructorOptions, toXyzConstructorOptions } from '../hydration';
import type { InjectedAuth } from '../hydration';
import { WmsOptionsSchema, WmtsOptionsSchema, XyzOptionsSchema } from '../schemas';
import type { WmsOptionsInput, WmtsOptionsInput, XyzOptionsInput } from '../schemas';

// The adapters only take `MCOptions`, so unlike `resolve*ConstructorOptions` invalid options throw instead of passing through as Cesium-native ones.

/** @throws when `options` are not valid WMTS options. */
export const adaptToCesiumWmtsOptions = (options: WmtsOptionsInput, auth?: InjectedAuth): RCesiumWMTSLayerOptions =>
  toWmtsConstructorOptions(WmtsOptionsSchema.parse(options), auth);

/** @throws when `options` are not valid WMS options. */
export const adaptToCesiumWmsOptions = (options: WmsOptionsInput, auth?: InjectedAuth): RCesiumWMSLayerOptions =>
  toWmsConstructorOptions(WmsOptionsSchema.parse(options), auth);

/** @throws when `options` are not valid XYZ options. */
export const adaptToCesiumXyzOptions = (options: XyzOptionsInput, auth?: InjectedAuth): RCesiumXYZLayerOptions =>
  toXyzConstructorOptions(XyzOptionsSchema.parse(options), auth);

export type CesiumLayerOptions = RCesiumWMTSLayerOptions | RCesiumWMSLayerOptions | RCesiumXYZLayerOptions;

/** Converts `MCOptions` into the Cesium imagery provider options of the given layer type; `null` for types that have no `MCOptions` form. */
export const adaptToCesiumOptions = (type: LayerType, options: MCOptions, auth?: InjectedAuth): CesiumLayerOptions | null => {
  switch (type) {
    case ProtocolType.WMTS:
      return adaptToCesiumWmtsOptions(options as WmtsOptionsInput, auth);
    case ProtocolType.WMS:
      return adaptToCesiumWmsOptions(options as WmsOptionsInput, auth);
    case ProtocolType.XYZ:
      return adaptToCesiumXyzOptions(options as XyzOptionsInput, auth);
    default:
      return null;
  }
};
