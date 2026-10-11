import React from 'react';

export const GuillochePattern: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden opacity-10 ${className}`}>
      <svg
        className="w-full h-full text-[#C9A24B]"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern id="guilloche" width="120" height="120" patternUnits="userSpaceOnUse">
            <path
              d="M0 60 C 30 10, 90 110, 120 60 C 90 10, 30 110, 0 60 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.75"
            />
            <path
              d="M60 0 C 10 30, 110 90, 60 120 C 10 90, 110 30, 60 0 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.75"
            />
            <circle cx="60" cy="60" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2,2" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#guilloche)" />
      </svg>
    </div>
  );
};