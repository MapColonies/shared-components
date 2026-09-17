import type { IBaseMap, IBaseMaps } from './map';

export const NO_BASEMAP_ID = '__cesium-map-no-basemap__';

export const isNoBasemapOption = (map: Pick<IBaseMap, 'id'>): boolean => map.id === NO_BASEMAP_ID;

export const withNoBasemapOption = (baseMaps: IBaseMaps, title: string): IBaseMaps => {
  const realMaps = baseMaps.maps.filter((map) => !isNoBasemapOption(map));
  const noBasemapOption: IBaseMap = {
    id: NO_BASEMAP_ID,
    title,
    isCurrent: !realMaps.some((map) => map.isCurrent),
    baseRasterLayers: [],
  };
  return { ...baseMaps, maps: [noBasemapOption, ...realMaps] };
};
