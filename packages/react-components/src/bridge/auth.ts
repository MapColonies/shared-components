import type { InjectedAuth } from '../hydration';

export const appendAuthQueryParameters = (url: string, auth?: InjectedAuth): string => {
  const query = Object.entries(auth?.queryParameters ?? {})
    .map(([name, value]) => `${encodeURIComponent(name)}=${encodeURIComponent(value)}`)
    .join('&');
  return query ? `${url}${url.includes('?') ? '&' : '?'}${query}` : url;
};
