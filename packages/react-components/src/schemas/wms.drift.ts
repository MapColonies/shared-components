// Compile-time guard: fails `tsc` when the schema and Cesium's WMS ConstructorOptions diverge.
// Type-only; not part of the runtime entry.
import type { WebMapServiceImageryProvider } from 'cesium';
import type { WmsOptionsInput, OMITTED_WMS_OPTIONS } from './wms';

type CesiumKeys = keyof WebMapServiceImageryProvider.ConstructorOptions;
type SchemaKeys = keyof WmsOptionsInput;
type OmittedKeys = keyof typeof OMITTED_WMS_OPTIONS;

type Assert<T extends never> = T;
// Every Cesium option must be either in the schema or explicitly omitted; a new Cesium option fails here.
export type NoUnhandledCesiumOptions = Assert<Exclude<CesiumKeys, SchemaKeys | OmittedKeys>>;
// Schema must not invent keys Cesium does not have (catches typos / removed options).
export type NoUnknownSchemaKeys = Assert<Exclude<SchemaKeys, CesiumKeys>>;
