import React, { useEffect, useState } from 'react';
import type { StoryFn, Meta } from '@storybook/react';
import { getValue } from '../../utils/config';
import { BASE_MAPS } from '../helpers/constants';
import { Cesium3DTileset } from '../layers/3d.tileset';
import { CesiumMap, CesiumMapProps, useCesiumMap } from '../map';

export default {
  title: 'Cesium Map/Screenshot',
  component: CesiumMap,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta;

const mapDivStyle = {
  height: '100%',
  width: '100%',
  position: 'absolute' as const,
};

const layerManagerMetaMapping = {
  layer: {
    id: 'id',
    name: 'layerRecord.productName',
  },
};

const mapViewProps: CesiumMapProps = {
  baseMaps: BASE_MAPS,
  layerManagerMetaMapping,
};

const DEMO_SIZES = {
  SMALL: { width: 150, height: 150 },
  MEDIUM: { width: 320, height: 200 },
  LARGE: { width: 300, height: 480 },
} as const;
type DemoSize = keyof typeof DEMO_SIZES;
const SIZE_KEYS = Object.keys(DEMO_SIZES) as DemoSize[];

const panelStyle: React.CSSProperties = {
  position: 'absolute',
  left: 12,
  bottom: 12,
  zIndex: 1001,
  background: 'rgba(20, 20, 24, 0.85)',
  color: '#eee',
  padding: 12,
  borderRadius: 6,
  fontFamily: 'sans-serif',
  fontSize: 12,
};

const cardStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 4,
  width: 96,
};

const previewBoxStyle: React.CSSProperties = {
  width: 72,
  height: 72,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px dashed #666',
  overflow: 'hidden',
  background: '#111',
};

const ScreenshotDemoPanel: React.FC = () => {
  const mapViewer = useCesiumMap();
  const [isComposing, setIsComposing] = useState(false);
  const [selectedSize, setSelectedSize] = useState<DemoSize>('SMALL');
  const [isCapturing, setIsCapturing] = useState(false);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [images, setImages] = useState<Partial<Record<DemoSize, string>>>({});

  useEffect(() => {
    return (): void => {
      Object.values(images).forEach((url) => url && URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapViewer.screenshot) {
      return;
    }
    if (isComposing) {
      mapViewer.screenshot.startCapturePreview(DEMO_SIZES[selectedSize]);
    } else {
      mapViewer.screenshot.stopCapturePreview();
    }
  }, [mapViewer, isComposing, selectedSize]);

  useEffect(() => {
    if (!mapViewer.screenshot) {
      return;
    }
    return mapViewer.screenshot.onLoadingChange(setIsContentLoading);
  }, [mapViewer]);

  if (!mapViewer.screenshot) {
    return (
      <div style={panelStyle}>
        screenshotEnabled is off for this map instance — flip it on in the Controls panel to try the
        capture demo. This is intentional: screenshot capability (and the WebGL configuration it
        needs) is opt-in per CesiumMap instance, not a global default.
      </div>
    );
  }

  const handleRemove = (size: DemoSize): void => {
    setImages((prev) => {
      const next = { ...prev };
      const url = next[size];
      if (url) {
        URL.revokeObjectURL(url);
      }
      delete next[size];
      return next;
    });
  };

  const handleCapture = async (): Promise<void> => {
    if (!mapViewer.screenshot) {
      return;
    }
    setIsCapturing(true);
    try {
      const blob = await mapViewer.screenshot.capture({ ...DEMO_SIZES[selectedSize], waitForTiles: true });
      setImages((prev) => {
        const next = { ...prev };
        const previousUrl = next[selectedSize];
        if (previousUrl) {
          URL.revokeObjectURL(previousUrl);
        }
        next[selectedSize] = URL.createObjectURL(blob);
        return next;
      });
      setIsComposing(false);
    } catch (err) {
      console.error('[screenshot.stories] capture failed', err);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <>
      <div style={panelStyle}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
          {SIZE_KEYS.map((size) => {
            const dims = DEMO_SIZES[size];
            const selected = isComposing && selectedSize === size;
            const previewUrl = images[size];

            const cardContent = (
              <>
                <div style={previewBoxStyle}>
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt={size}
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{ color: '#888' }}>empty</span>
                  )}
                </div>
                <div style={{ textAlign: 'center' }}>{`${size} (${dims.width}×${dims.height})`}</div>
                {previewUrl && (
                  <button
                    type="button"
                    onClick={(evt): void => {
                      evt.stopPropagation();
                      handleRemove(size);
                    }}
                  >
                    Remove
                  </button>
                )}
              </>
            );

            if (!isComposing) {
              return (
                <div key={size} style={cardStyle}>
                  {cardContent}
                </div>
              );
            }

            return (
              <label
                key={size}
                style={{
                  ...cardStyle,
                  cursor: 'pointer',
                  boxShadow: selected ? '0 0 0 3px #1976d2' : undefined,
                }}
              >
                <input
                  type="radio"
                  name="demoCaptureSize"
                  checked={selectedSize === size}
                  onChange={(): void => setSelectedSize(size)}
                  style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                />
                {cardContent}
              </label>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {isComposing ? (
            <>
              <button
                type="button"
                disabled={isCapturing || isContentLoading}
                onClick={(): void => setIsComposing(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isCapturing || isContentLoading}
                onClick={(): void => void handleCapture()}
              >
                {isCapturing ? 'Capturing…' : isContentLoading ? 'Loading tiles…' : 'Capture'}
              </button>
            </>
          ) : (
            <button type="button" onClick={(): void => setIsComposing(true)}>
              Capture Thumbnail
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export const Screenshot: StoryFn<CesiumMapProps> = (args) => (
  <div style={mapDivStyle}>
    <CesiumMap {...mapViewProps} {...args}>
      <Cesium3DTileset
        url={getValue('GLOBAL', '3D_MODEL')}
        meta={{ id: '1111111', layerRecord: { productName: 'Model A' } }}
        isZoomTo={true}
      />
      <ScreenshotDemoPanel />
    </CesiumMap>
  </div>
);

Screenshot.args = {
  screenshotEnabled: true,
};
