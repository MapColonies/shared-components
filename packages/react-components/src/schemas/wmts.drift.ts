// Compile-time guard: fails `tsc` when the schema and Cesium's WMTS ConstructorOptions diverge.
// Type-only; not part of the runtime entry.
import type { WebMapTileServiceImageryProvider } from 'cesium';
import type { WmtsOptionsInput, OMITTED_WMTS_OPTIONS } from './wmts';

type CesiumKeys = keyof WebMapTileServiceImageryProvider.ConstructorOptions;
type SchemaKeys = keyof WmtsOptionsInput;
type OmittedKeys = keyof typeof OMITTED_WMTS_OPTIONS;

type Assert<T extends never> = T;
// Every Cesium option must be either in the schema or explicitly omitted; a new Cesium option fails here.
export type NoUnhandledCesiumOptions = Assert<Exclude<CesiumKeys, SchemaKeys | OmittedKeys>>;
// Schema must not invent keys Cesium does not have (catches typos / removed options).
export type NoUnknownSchemaKeys = Assert<Exclude<SchemaKeys, CesiumKeys>>;
