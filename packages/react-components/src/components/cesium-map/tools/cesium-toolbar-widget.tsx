import React, { useEffect, ReactNode } from 'react';
import ReactDOM from 'react-dom';

interface CesiumToolbarWidgetProps {
  header: ReactNode;
  icon: ReactNode;
  content: ReactNode;
}

export const CesiumToolbarWidget: React.FC<CesiumToolbarWidgetProps> = ({ header, icon, content }) => {
  useEffect(() => {
    const toolbar = document.querySelector('.cesium-viewer-toolbar');

    if (toolbar) {
      const widgetContainer = document.createElement('div');
      widgetContainer.className = 'cesium-toolbar-widget';

      const headerDiv = document.createElement('div');
      ReactDOM.render(<>{header}</>, headerDiv);
      widgetContainer.appendChild(headerDiv);

      const iconDiv = document.createElement('div');
      ReactDOM.render(<>{icon}</>, iconDiv);
      widgetContainer.appendChild(iconDiv);

      const contentDiv = document.createElement('div');
      ReactDOM.render(<>{content}</>, contentDiv);
      widgetContainer.appendChild(contentDiv);

      toolbar.appendChild(widgetContainer);
    }

    return () => {
      if (toolbar) {
        const widgetContainer = toolbar.querySelector('.cesium-toolbar-widget');
        if (widgetContainer) {
          toolbar.removeChild(widgetContainer);
        }
      }
    };
  }, [header, icon, content]);

  return null;
};
