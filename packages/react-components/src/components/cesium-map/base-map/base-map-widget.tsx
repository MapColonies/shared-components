import React, { useMemo, useState } from 'react';
import { TerrainProvider } from 'cesium';
import { get } from 'lodash';
import { IBaseMaps } from '../map';
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
  const baseMapsTitle = useMemo(() => get(locale, 'BASE_MAP_TITLE') ?? 'Base Map', [locale]);
  const terrainsTitle = useMemo(() => get(locale, 'TERRAIN_TITLE') ?? 'Terrain', [locale]);

  return (
    <>
      <CesiumIcon onClick={() => setIsOpen(prev => !prev)}>
        <img className="cesium-baseLayerPicker-selected" src="assets/img/1st.png" title="1st Map" />
      </CesiumIcon>
      <CesiumTool isVisible={isOpen} title={''}>
        <div className="cesium-baseLayerPicker-sectionTitle">{baseMapsTitle}</div>
        <BaseMapsPanel baseMaps={baseMaps}></BaseMapsPanel>
        <div className="cesium-baseLayerPicker-sectionTitle">{terrainsTitle}</div>
        <TerrainsPanel terrainProviders={terrainProvider ? [terrainProvider] : []}></TerrainsPanel>
      </CesiumTool>
    </>
  );
};
