import React, { useState, useEffect } from 'react';

interface NewsImageProps {
  src?: string;
  fallbackUrl?: string;
  alt: string;
  className?: string;
}

// Gráfico de seguridad SVG Data URI en caso extremo de falla completa de red
const SVG_FAILSAFE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="100%" height="100%" fill="%23152E21"/><rect x="5%" y="5%" width="90%" height="90%" fill="none" stroke="%23C9A24B" stroke-width="2" stroke-opacity="0.4"/><circle cx="300" cy="170" r="45" fill="%2310241A" stroke="%23C9A24B" stroke-width="3"/><path d="M290 145h20v50h-20zM280 160h40v20h-40z" fill="%23C9A24B"/><text x="50%" y="270" font-family="Georgia, serif" font-size="22" fill="%23F1EDE1" text-anchor="middle" font-weight="bold">DÓLAR BOLIVIA</text><text x="50%" y="300" font-family="monospace" font-size="13" fill="%23C9A24B" text-anchor="middle">REPORTE FINANCIERO</text></svg>`;

export const NewsImage: React.FC<NewsImageProps> = ({ src, fallbackUrl, alt, className = '' }) => {
  // Nivel 0: Usar imagen primaria
  // Nivel 1: Usar fallback dinámico por semilla única
  // Nivel 2: Usar SVG Data URI
  const [stage, setStage] = useState<number>(src ? 0 : (fallbackUrl ? 1 : 2));

  useEffect(() => {
    setStage(src ? 0 : (fallbackUrl ? 1 : 2));
  }, [src, fallbackUrl]);

  const handleError = () => {
    setStage((prev) => {
      if (prev === 0 && fallbackUrl) return 1;
      return 2;
    });
  };

  let activeSrc = src;
  if (stage === 1) activeSrc = fallbackUrl || SVG_FAILSAFE;
  if (stage === 2) activeSrc = SVG_FAILSAFE;

  return (
    <img
      src={activeSrc}
      alt={alt}
      onError={handleError}
      loading="lazy"
      referrerPolicy="no-referrer"
      className={className}
    />
  );
};