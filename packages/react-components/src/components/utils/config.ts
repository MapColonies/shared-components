//@ts-ignore
import CONFIG from '../../../stories-data.json';

export const getValue = (storyName: string, key: string): string => {
  return (CONFIG as Record<string, Record<string, string>>)[storyName][key];
};
