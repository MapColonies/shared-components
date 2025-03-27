import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Icon } from '@map-colonies/react-core';
import { useCesiumMap } from '../map';
import { WFS } from './wfs';

import './debug-panel.css';

export interface IDebugPanelProps {
  locale?: { [key: string]: string };
}

export const DebugPanel: React.FC<IDebugPanelProps> = ({ locale }) => {
  const mapViewer = useCesiumMap();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      <Icon
        icon={
          <div className="debugPanelIconContainer">
            <svg width="100%" height="100%" viewBox="0 0 24 24">
              <path d="M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27-7.38 5.74zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27L12 16z"/>
            </svg>
          </div>
        }
        onClick={(): void => {
          setIsOpen(!isOpen);
        }}
      />
      {
        isOpen &&
        <div className="debugPanel">
          <Dialog
            open={isOpen}
            onClosed={(): void => {
              setIsOpen(false);
            }}
          >
            <DialogTitle></DialogTitle>
            <DialogContent>
              <WFS locale={locale} />
            </DialogContent>
          </Dialog>
        </div>
      }
    </>
  );
};
