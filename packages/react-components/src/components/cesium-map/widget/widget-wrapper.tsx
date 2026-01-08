import React, { useEffect, useRef, useState } from 'react';

import './widget-wrapper.css';

export interface IWidgetProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

export function WidgetWrapper<P extends IWidgetProps>(WrappedComponent: React.JSXElementConstructor<P>) {
  type OuterProps = Omit<P, keyof IWidgetProps>;

  return function _(props: OuterProps) {
    const widgetRef = useRef<HTMLDivElement | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
      if (!isOpen) {
        return;
      }
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        if (widgetRef.current && !widgetRef.current.contains(target)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('click', handleClickOutside, true);
      return () => {
        document.removeEventListener('click', handleClickOutside, true);
      };
    }, [isOpen]);


    return (
      <div ref={widgetRef} className="disappear">
        <WrappedComponent {...props as P} isOpen={isOpen} setIsOpen={setIsOpen} />
      </div>
    );
  }
}
