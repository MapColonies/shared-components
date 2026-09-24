import React, { useMemo, useState } from 'react';
import { get } from 'lodash';
import { IBaseMap, IBaseMaps, ITerrain, useCesiumMap } from '../map';
import { CesiumIcon } from '../widget/cesium-icon';
import { CesiumTool } from '../widget/cesium-tool';
import { IWidgetProps, WidgetWrapper } from '../widget/widget-wrapper';
import { BaseMapThumbnail } from './base-map-thumbnail';
import { BaseMapsPanel } from './base-maps-panel';
import { TerrainsPanel } from './terrains-panel';

interface IBaseMapWidgetProps extends IWidgetProps {
  baseMaps?: IBaseMaps;
  terrains?: ITerrain[];
  locale?: { [key: string]: string };
}

const BaseMapComponent: React.FC<IBaseMapWidgetProps> = ({ baseMaps, terrains, locale, isOpen, setIsOpen }) => {
  const mapViewer = useCesiumMap();
  const [selected, setSelected] = useState<IBaseMap>();
  const baseMapsTitle = useMemo(() => get(locale, 'BASE_MAP_TITLE') ?? 'Base Map', [locale]);
  const terrainsTitle = useMemo(() => get(locale, 'TERRAIN_TITLE') ?? 'Terrain', [locale]);
  const none = useMemo(() => get(locale, 'NONE') ?? 'None', [locale]);
  const fallbackColor = mapViewer.scene.globe.baseColor.toCssColorString();

  return (
    <>
      <CesiumIcon onClick={() => setIsOpen(!isOpen)}>
        <BaseMapThumbnail
          className="cesium-baseLayerPicker-selected"
          src={selected?.thumbnail}
          title={selected?.title ?? none}
          alt="Current Map"
          fallbackColor={fallbackColor}
        />
      </CesiumIcon>
      <CesiumTool isVisible={isOpen}>
        {baseMaps && <BaseMapsPanel title={baseMapsTitle} baseMaps={baseMaps} setCurrent={setSelected} />}
        {terrains && <TerrainsPanel title={terrainsTitle} terrains={terrains}></TerrainsPanel>}
      </CesiumTool>
    </>
  );
};

export const BaseMapWidget = WidgetWrapper(BaseMapComponent);
