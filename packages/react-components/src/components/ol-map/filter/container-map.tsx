import React, { PropsWithChildren } from 'react';
import { Geometry } from 'geojson';
import rewind from '@turf/rewind';
import { Polygon } from 'geojson';
import { Map } from '../map';
import { TileLayer } from '../layers/tile-layer';
import { VectorSource } from '../source/vector-source';
import { GeoJSONFeature } from '../feature';
import { TileOsm } from '../source/osm';
import { VectorLayer } from '../layers/vector-layer';
import { DrawInteraction } from '../interactions/draw';
import { DrawType } from '../../models/enums';
import './container-map.css';

interface ContainerMapProps {
  drawType?: DrawType;
  selectionPolygon?: Polygon;
  onPolygonSelection: (polygon: Polygon) => void;
}

export const ContainerMap: React.FC<PropsWithChildren<ContainerMapProps>> = (props) => {
  const handlePolygonSelected = (geometry: Geometry): void => {
    const rewindedPolygon = rewind(geometry as Polygon);
    props.onPolygonSelection(rewindedPolygon);
  };

  return (
    <Map allowFullScreen={true} showMousePosition={true}>
      <TileLayer>
        <TileOsm />
      </TileLayer>
      {props.selectionPolygon && (
        <VectorLayer>
          <VectorSource>
            <GeoJSONFeature geometry={props.selectionPolygon} />
          </VectorSource>
        </VectorLayer>
      )}
      {props.children}
      {props.drawType !== undefined && <DrawInteraction drawType={props.drawType} onPolygonSelected={handlePolygonSelected} />}
    </Map>
  );
};
