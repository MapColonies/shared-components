import React, { useEffect, useState } from 'react';

const NO_BASEMAP_THUMBNAIL =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">' +
      '<rect width="32" height="32" rx="4" fill="#2c3037"/>' +
      // Map regions / boundaries
      '<path d="M2,10 L9,7 L15,9 L21,5 L30,8" ' +
        'fill="none" stroke="#59636d" stroke-width="0.8"/>' +
      '<path d="M7,2 L9,7 L8,14 L12,20 L10,30" ' +
        'fill="none" stroke="#59636d" stroke-width="0.8"/>' +
      '<path d="M21,5 L20,12 L24,17 L22,23 L27,30" ' +
        'fill="none" stroke="#59636d" stroke-width="0.8"/>' +
      // Main road
      '<path d="M3,25 C8,22 10,16 15,15 C20,14 23,10 29,11" ' +
        'fill="none" stroke="#8fa3b3" stroke-width="1.3" ' +
        'stroke-linecap="round"/>' +
      // Secondary road
      '<path d="M14,3 C13,8 15,11 15,15 C15,20 19,24 19,29" ' +
        'fill="none" stroke="#727f8a" stroke-width="1" ' +
        'stroke-linecap="round"/>' +
      // Small road
      '<path d="M5,18 L11,18 L15,15 L21,17 L28,15" ' +
        'fill="none" stroke="#59636d" stroke-width="0.7" ' +
        'stroke-linecap="round"/>' +
      '</svg>'
  );

interface BaseMapThumbnailProps {
  className: string;
  src?: string;
  alt: string;
  title?: string;
  onClick?: () => void;
}

export const BaseMapThumbnail: React.FC<BaseMapThumbnailProps> = ({
  className,
  src,
  alt,
  title,
  onClick,
}) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const resolvedSrc = !src || failed ? NO_BASEMAP_THUMBNAIL : src;

  return (
    <img
      className={className}
      src={resolvedSrc}
      alt={alt}
      title={title}
      onClick={onClick}
      onError={() => setFailed(true)}
    />
  );
};
