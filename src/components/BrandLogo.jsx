/**
 * WebGuard horizontal lockup — shield mark + wordmark + tagline.
 * Matches the visiting-page brand system (Monitor. Protect. Assure.).
 */
import { useId } from 'react';

const sizes = {
  sm: { icon: 28, name: 'text-base', tag: 'hidden' },
  nav: { icon: 36, name: 'text-lg', tag: 'text-[10px]' },
  sidebar: { icon: 40, name: 'text-xl', tag: 'text-[11px]' },
  auth: { icon: 40, name: 'text-xl', tag: 'text-[11px]' },
};

function ShieldMark({ size = 40, className = '' }) {
  const gid = useId().replace(/:/g, '');

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="16" width="10" height="3.2" rx="1.6" fill="#3B82F6" opacity="0.9" />
      <rect x="0" y="22.4" width="14" height="3.2" rx="1.6" fill="#2563EB" />
      <rect x="3" y="28.8" width="8" height="3.2" rx="1.6" fill="#60A5FA" opacity="0.85" />
      <path
        d="M26 6.5L40 12.2V22.8C40 32.2 34.2 40.2 26 42.5C17.8 40.2 12 32.2 12 22.8V12.2L26 6.5Z"
        fill={`url(#${gid})`}
      />
      <path
        d="M26 9.2L37.2 13.7V22.8C37.2 30.6 32.4 37.2 26 39.2C19.6 37.2 14.8 30.6 14.8 22.8V13.7L26 9.2Z"
        fill="#1E3A8A"
        opacity="0.25"
      />
      <path
        d="M18.8 17.2L21.6 31.2H24.4L26 22.6L27.6 31.2H30.4L33.2 17.2H30.2L28.7 26.4L27 17.2H25L23.3 26.4L21.8 17.2H18.8Z"
        fill="white"
      />
      <defs>
        <linearGradient id={gid} x1="12" y1="6" x2="40" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B82F6" />
          <stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function BrandLogo({ size = 'nav', className = '', showTagline = true }) {
  const s = sizes[size] || sizes.nav;

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <ShieldMark size={s.icon} className="shrink-0" />
      <div className="leading-tight min-w-0">
        <p className={`font-bold tracking-tight text-ink ${s.name}`}>
          <span className="sr-only">WebGuard</span>
          <span aria-hidden="true">
            Web<span className="text-brand">Guard</span>
          </span>
        </p>
        {showTagline && s.tag !== 'hidden' && (
          <p className={`text-muted font-medium tracking-wide ${s.tag}`}>
            Monitor. Protect. Assure.
          </p>
        )}
      </div>
    </div>
  );
}

export { ShieldMark };
