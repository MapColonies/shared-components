import { z } from 'zod';

// Query parameter names that commonly carry secrets. Tokens are injected at runtime, never stored in options.
const SECRET_QUERY_PARAMS = ['token', 'access_token', 'accesstoken', 'key', 'apikey', 'api_key', 'password', 'pwd', 'sig', 'signature'];

export const hasEmbeddedCredentials = (url: string): boolean => {
  if (/^[a-z][a-z0-9+.-]*:\/\/[^/?#]*@/i.test(url)) {
    return true;
  }
  const queryStart = url.indexOf('?');
  if (queryStart === -1) {
    return false;
  }
  const params = new URLSearchParams(url.slice(queryStart + 1).split('#')[0]);
  return [...params.keys()].some((name) => SECRET_QUERY_PARAMS.includes(name.toLowerCase()));
};

export interface UrlPolicy {
  /** Explicit opt-in: permit credentials/tokens embedded in URLs. Decided by the validating party (e.g. a backend policy), never by the payload. */
  allowUrlCredentials?: boolean;
}

/** Absolute URL (tile templates with `{placeholders}` allowed). Rejects embedded credentials unless explicitly allowed. */
export const createUrlSchema = (description: string, { allowUrlCredentials = false }: UrlPolicy = {}) => {
  const base = z.string().url();
  return allowUrlCredentials
    ? base.describe(`${description} Embedded credentials are permitted.`)
    : base
        .refine((url) => !hasEmbeddedCredentials(url), { message: 'URL must not contain credentials or tokens; they are injected at runtime' })
        .describe(`${description} Do not embed credentials or tokens.`);
};

/** Geographic extent in DEGREES (the hydrator converts to Cesium radians). */
export const RectangleDegSchema = z
  .object({
    west: z.number().min(-180).max(180).describe('Western edge in degrees'),
    south: z.number().min(-90).max(90).describe('Southern edge in degrees'),
    east: z.number().min(-180).max(180).describe('Eastern edge in degrees'),
    north: z.number().min(-90).max(90).describe('Northern edge in degrees'),
  })
  .strict();

export const TilingSchemeNameSchema = z.enum(['geographic', 'webmercator']);
