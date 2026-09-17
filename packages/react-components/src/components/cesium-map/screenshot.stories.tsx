import React, { useEffect, useState } from 'react';
import type { StoryFn, Meta } from '@storybook/react';
import { BASE_MAPS } from './helpers/constants';
import { CesiumMap, CesiumMapProps, useCesiumMap } from './map';
import { calculateCenteredCropRegion } from './screenshot';

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
  LARGE: { width: 480, height: 300 },
} as const;
type DemoSize = keyof typeof DEMO_SIZES;
const SIZE_KEYS = Object.keys(DEMO_SIZES) as DemoSize[];

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

const CaptureRectangleOverlay: React.FC<{ dimensions: { width: number; height: number } }> = ({
  dimensions,
}) => {
  const mapViewer = useCesiumMap();
  const [rect, setRect] = useState<Rect | null>(null);

  useEffect(() => {
    const canvas = mapViewer.canvas;

    const update = (): void => {
      const pixelRatio = canvas.clientWidth > 0 ? canvas.width / canvas.clientWidth : 1;
      const region = calculateCenteredCropRegion(
        canvas.clientWidth,
        canvas.clientHeight,
        dimensions.width / pixelRatio,
        dimensions.height / pixelRatio
      );
      setRect({ left: region.x, top: region.y, width: region.width, height: region.height });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(canvas);
    return (): void => observer.disconnect();
  }, [mapViewer, dimensions.width, dimensions.height]);

  if (!rect) {
    return null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        border: '2px dashed #fff',
        boxShadow: '0 0 0 2000px rgba(0, 0, 0, 0.45)',
        pointerEvents: 'none',
        zIndex: 1000,
        boxSizing: 'border-box',
      }}
    />
  );
};

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
  const [images, setImages] = useState<Partial<Record<DemoSize, string>>>({});

  useEffect(() => {
    return (): void => {
      Object.values(images).forEach((url) => url && URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      const blob = await mapViewer.screenshot.capture(DEMO_SIZES[selectedSize]);
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
      {isComposing && <CaptureRectangleOverlay dimensions={DEMO_SIZES[selectedSize]} />}
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
                <div>{`${size} (${dims.width}×${dims.height})`}</div>
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
              <button type="button" disabled={isCapturing} onClick={(): void => setIsComposing(false)}>
                Cancel
              </button>
              <button type="button" disabled={isCapturing} onClick={(): void => void handleCapture()}>
                {isCapturing ? 'Capturing…' : 'Capture'}
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
      <ScreenshotDemoPanel />
    </CesiumMap>
  </div>
);

Screenshot.args = {
  screenshotEnabled: true,
};
Screenshot.storyName = 'Screenshot Capture Playground';
