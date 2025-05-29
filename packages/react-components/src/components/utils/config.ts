// stories-data.json is a dynamic, gitignored file and may not always exist.
// To avoid import errors, use a try-catch dynamic require or fallback to an empty object.

let CONFIG: any = {};
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  CONFIG = require('../../stories-data.json');
} catch {
  CONFIG = {};
}

export const getValue = (storyName: string, key: string): string => {
  return (CONFIG as Record<string, Record<string, string>>)[storyName][key];
};