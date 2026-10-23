import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';

interface SchoolCrestProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

export const SchoolCrest: React.FC<SchoolCrestProps> = ({
  size = 'md',
  className = '',
  showText = false
}) => {
  const { schoolInfo } = useSchool();
  const [imgError, setImgError] = useState(false);

  const sizeMap = {
    sm: 'w-10 h-12',
    md: 'w-14 h-16',
    lg: 'w-20 h-24',
    xl: 'w-32 h-36'
  };

  // Official school crest logo
  const logoSource = schoolInfo?.logoUrl || '/logo.png';

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div className={`relative ${sizeMap[size]} flex-shrink-0 select-none drop-shadow-sm flex items-center justify-center`}>
        {!imgError ? (
          <img
            src={logoSource}
            alt="Official Ghanata Senior High School Crest (Dodowa)"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-contain filter drop-shadow-sm transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <svg
            viewBox="0 0 400 470"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            <defs>
              <clipPath id="crestShieldClipFallback">
                <path d="M 108,145 Q 154,152 200,162 Q 246,152 292,145 L 292,238 C 292,305 246,346 200,366 C 154,346 108,305 108,238 Z" />
              </clipPath>
            </defs>

            {/* Outer Shield */}
            <path 
              d="M 36,36 L 364,36 L 364,265 C 364,365 292,425 200,446 C 108,425 36,365 36,265 Z" 
              fill="#ffffff" 
              stroke="#000000" 
              strokeWidth="7" 
              strokeLinejoin="round"
            />

            {/* Inscriptions */}
            <g textAnchor="middle" fontFamily="sans-serif" fill="#000000">
              <text x="200" y="82" fontSize="33" fontWeight="900" letterSpacing="1.5">GHANATA</text>
              <text x="200" y="112" fontSize="20" fontWeight="800">SENIOR HIGH SCH.</text>
              <text x="200" y="137" fontSize="22" fontWeight="900">DODOWA</text>
              <text x="76" y="235" fontSize="28" fontWeight="900">19</text>
              <text x="324" y="235" fontSize="28" fontWeight="900">36</text>
            </g>

            {/* Inner Crest */}
            <g clipPath="url(#crestShieldClipFallback)">
              <rect x="90" y="135" width="220" height="120" fill="#facc15" />
              <rect x="90" y="250" width="220" height="130" fill="#15803d" />
              <line x1="90" y1="250" x2="310" y2="250" stroke="#000000" strokeWidth="3" />

              <circle cx="200" cy="250" r="42" fill="#1d4ed8" stroke="#000000" strokeWidth="2.5" />
              <path d="M 158,250 A 42 42 0 0 1 242,250 Z" fill="#facc15" stroke="#000000" strokeWidth="2.5" />

              {/* Torch */}
              <polygon points="196,208 204,208 202,280 198,280" fill="#facc15" stroke="#000000" strokeWidth="2" />
              <ellipse cx="200" cy="208" rx="10" ry="4" fill="#000000" />
              <g transform="translate(200, 192)">
                <path d="M -26,10 C -24,4 -18,-6 -14,-10 C -10,-14 -12,-22 -8,-28 C -4,-18 2,-24 6,-30 C 10,-24 18,-18 14,-8 C 22,-14 26,-6 24,10 C 20,16 -20,16 -26,10 Z" fill="#dc2626" />
                <path d="M -16,6 C -12,0 -8,-10 -5,-18 C -2,-10 4,-14 6,-20 C 8,-14 14,-8 12,6 Z" fill="#f97316" />
              </g>

              {/* Sash */}
              <g transform="rotate(-30, 200, 250)">
                <rect x="110" y="237" width="180" height="26" fill="#000000" />
                <text x="200" y="256" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="900" letterSpacing="2">GHANATA</text>
              </g>

              {/* Book */}
              <g transform="translate(200, 322)">
                <path d="M 0,0 C -12,-6 -28,-6 -40,0 L -40,18 C -28,12 -12,12 0,18 C 12,12 28,12 40,18 L 40,0 C 28,-6 12,-6 0,0 Z" fill="#ffffff" stroke="#000000" strokeWidth="2.5" strokeLinejoin="round" />
                <line x1="0" y1="0" x2="0" y2="18" stroke="#000000" strokeWidth="2.5" />
              </g>
            </g>

            <path 
              d="M 108,145 Q 154,152 200,162 Q 246,152 292,145 L 292,238 C 292,305 246,346 200,366 C 154,346 108,305 108,238 Z" 
              fill="none" 
              stroke="#000000" 
              strokeWidth="6" 
              strokeLinejoin="round"
            />

            {/* Bottom Banner */}
            <g transform="translate(0, 365)">
              <polygon points="106,12 86,22 106,32 94,22" fill="#eab308" stroke="#000000" strokeWidth="2.5" />
              <polygon points="294,12 314,22 294,32 306,22" fill="#eab308" stroke="#000000" strokeWidth="2.5" />
              <path d="M 100,20 Q 200,38 300,20 L 296,44 Q 200,62 104,44 Z" fill="#facc15" stroke="#000000" strokeWidth="3" strokeLinejoin="round" />
              <text x="200" y="43" textAnchor="middle" fill="#000000" fontSize="19" fontWeight="900" letterSpacing="2.5">CARPE DIEM</text>
            </g>
          </svg>
        )}
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="font-heading font-bold text-stone-900 tracking-wider text-base sm:text-lg leading-tight uppercase">
            {schoolInfo?.name || 'Ghanata Senior High'}
          </span>
          <span className="text-xs text-yellow-800 font-semibold tracking-widest uppercase">
            {schoolInfo?.town || 'Dodowa'} · Est. {schoolInfo?.established || 1936}
          </span>
        </div>
      )}
    </div>
  );
};
