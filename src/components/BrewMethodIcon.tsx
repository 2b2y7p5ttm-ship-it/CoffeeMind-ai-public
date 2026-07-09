// SVG icons for each brewing method — hand-crafted, single-stroke style
import type { ReactElement } from 'react';
import { getBrewIcon } from '@/lib/coffeeUtils';

interface BrewMethodIconProps {
  method: string;
  size?: number;
  className?: string;
}

export function BrewMethodIcon({ method, size = 18, className = '' }: BrewMethodIconProps) {
  const key = getBrewIcon(method);

  const icons: Record<string, ReactElement> = {
    pourover: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M8 3h8l-1 5H9L8 3z" />
        <path d="M9 8v1a3 3 0 0 0 6 0V8" />
        <path d="M7 21h10" />
        <path d="M12 13v8" />
        <path d="M9.5 16.5c0 0-1-1 0-2s1-2 0-3" />
        <path d="M14.5 16.5c0 0 1-1 0-2s-1-2 0-3" />
      </svg>
    ),
    espresso: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M6 3h12v6H6z" />
        <path d="M8 9v3a4 4 0 0 0 8 0V9" />
        <path d="M4 21h16" />
        <path d="M12 15v6" />
        <path d="M10 21h4" />
      </svg>
    ),
    aeropress: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="8" y="2" width="8" height="14" rx="2" />
        <path d="M10 6h4" />
        <path d="M10 9h4" />
        <path d="M10 12h4" />
        <path d="M12 16v6" />
        <path d="M9 22h6" />
      </svg>
    ),
    frenchpress: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M8 3h8" />
        <path d="M12 3v2" />
        <rect x="7" y="5" width="10" height="14" rx="1" />
        <path d="M9 10h6" />
        <path d="M12 10v9" />
        <path d="M6 19h12" />
      </svg>
    ),
    coldbrew: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 2v4M8.5 3.5l2 2M15.5 3.5l-2 2" />
        <path d="M7 8h10l-1 11a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2L7 8z" />
        <path d="M9 12h6" />
      </svg>
    ),
    chemex: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M8 3l-3 9h14L16 3H8z" />
        <path d="M9.5 12l-2 9h9l-2-9" />
        <path d="M11 12h2" />
      </svg>
    ),
    moka: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M9 21H7a2 2 0 0 1-2-2v-5l2-4h10l2 4v5a2 2 0 0 1-2 2h-2" />
        <path d="M9 21h6" />
        <path d="M12 3v2" />
        <path d="M8 5h8a1 1 0 0 1 1 1v2H7V6a1 1 0 0 1 1-1z" />
      </svg>
    ),
    default: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
        <path d="M6 1v3M10 1v3M14 1v3" />
      </svg>
    ),
  };

  return icons[key] ?? icons.default;
}
