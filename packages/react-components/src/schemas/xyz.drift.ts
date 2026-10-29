// Compile-time guard: fails `tsc` when the schema and Cesium's UrlTemplate ConstructorOptions diverge.
// Type-only; not part of the runtime entry.
import type { UrlTemplateImageryProvider } from 'cesium';
import type { XyzOptionsInput, OMITTED_XYZ_OPTIONS } from './xyz';

type CesiumKeys = keyof UrlTemplateImageryProvider.ConstructorOptions;
type SchemaKeys = keyof XyzOptionsInput;
type OmittedKeys = keyof typeof OMITTED_XYZ_OPTIONS;

type Assert<T extends never> = T;
// Every Cesium option must be either in the schema or explicitly omitted; a new Cesium option fails here.
export type NoUnhandledCesiumOptions = Assert<Exclude<CesiumKeys, SchemaKeys | OmittedKeys>>;
// Schema must not invent keys Cesium does not have (catches typos / removed options).
export type NoUnknownSchemaKeys = Assert<Exclude<SchemaKeys, CesiumKeys>>;
