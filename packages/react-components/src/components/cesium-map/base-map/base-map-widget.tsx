import React, { useMemo, useState } from 'react';
import { TerrainProvider } from 'cesium';
import { get } from 'lodash';
import { IBaseMap, IBaseMaps } from '../map';
import { CesiumIcon } from '../widget/cesium-icon';
import { CesiumTool } from '../widget/cesium-tool';
import { BaseMapsPanel } from './base-maps-panel';
import { TerrainsPanel } from './terrains-panel';

interface IBaseMapWidgetProps {
  baseMaps?: IBaseMaps;
  terrainProvider?: TerrainProvider;
  locale?: { [key: string]: string };
}

export const BaseMapWidget: React.FC<IBaseMapWidgetProps> = ({ baseMaps, terrainProvider, locale }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<IBaseMap>();
  const baseMapsTitle = useMemo(() => get(locale, 'BASE_MAP_TITLE') ?? 'Base Map', [locale]);
  const terrainsTitle = useMemo(() => get(locale, 'TERRAIN_TITLE') ?? 'Terrain', [locale]);

  return (
    <>
      <CesiumIcon onClick={() => setIsOpen(prev => !prev)}>
        <img 
          className="cesium-baseLayerPicker-selected"
          src={selected?.thumbnail}
          title={selected?.title}
          alt="Current Map"
        />
      </CesiumIcon>
      <CesiumTool isVisible={isOpen}>
        <BaseMapsPanel title={baseMapsTitle} baseMaps={baseMaps} setCurrent={setSelected} />
        <TerrainsPanel title={terrainsTitle} terrainProvider={terrainProvider}></TerrainsPanel>
      </CesiumTool>
    </>
  );
};
