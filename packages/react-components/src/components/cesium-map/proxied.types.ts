import {
  BillboardGraphics,
  BoundingSphere,
  Cartesian2,
  Cartesian3,
  Cartographic,
  CesiumTerrainProvider,
  ConstantPositionProperty,
  ConstantProperty,
  Ellipsoid,
  EllipsoidTerrainProvider,
  GeographicTilingScheme,
  HeightReference,
  HorizontalOrigin,
  JulianDate,
  LabelStyle,
  PolylineDashMaterialProperty,
  PolylineGraphics,
  PositionProperty,
  Rectangle,
  Resource,
  VerticalOrigin,
} from 'cesium';

// PROXIED CLASSES
export class CesiumPolylineDashMaterialProperty extends PolylineDashMaterialProperty {}

export class CesiumConstantProperty extends ConstantProperty {}

export class CesiumConstantPositionProperty extends ConstantPositionProperty {}

export class CesiumCartesian2 extends Cartesian2 {}

export class CesiumCartesian3 extends Cartesian3 {}

export class CesiumCartographic extends Cartographic {}

export class CesiumBoundingSphere extends BoundingSphere {}

export class CesiumEllipsoid extends Ellipsoid {}

export class CesiumGeographicTilingScheme extends GeographicTilingScheme {}

export class CesiumRectangle extends Rectangle {}

export class CesiumResource extends Resource {}

export class CesiumEllipsoidTerrainProvider extends EllipsoidTerrainProvider {}

export class CesiumCesiumTerrainProvider extends CesiumTerrainProvider {}

export class CesiumCesiumPolylineGraphics extends PolylineGraphics {}

export class CesiumJulianDate extends JulianDate {}

export class CesiumPositionProperty extends PositionProperty {}

export class CesiumCesiumBillboardGraphics extends BillboardGraphics {}

// PROXIED ENUMS
// eslint-disable-next-line @typescript-eslint/naming-convention
export const CesiumVerticalOrigin = VerticalOrigin;
export const CesiumHorizontalOrigin = HorizontalOrigin;

// eslint-disable-next-line @typescript-eslint/naming-convention
export const CesiumLabelStyle = LabelStyle;

export const CesiumHeightReference = HeightReference;

// PROXIED FUNCTIONS
export {
  Entity as CesiumCesiumEntity,
  GeoJsonDataSource as CesiumGeoJsonDataSource,
  Math as CesiumMath,
  PolygonGraphics as CesiumCesiumPolygonGraphics,
  sampleTerrainMostDetailed as cesiumSampleTerrainMostDetailed,
} from 'cesium';
