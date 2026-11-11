// Íconos de línea (SVG propio, decorativos).
const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
  focusable: 'false',
};

export const HomeIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10" />
  </svg>
);
export const ClipboardIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="5" y="4" width="14" height="17" rx="2" />
    <path d="M9 4V3h6v1M9 13l2 2 4-4" />
  </svg>
);
export const SendIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M21 3L3 10l7 3 3 7zM10 13l11-10" />
  </svg>
);
export const BarsIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M4 20v-5h4v5M10 20V9h4v11M16 20V4h4v16" />
  </svg>
);
export const ArrowRightIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M4 12h16M14 6l6 6-6 6" />
  </svg>
);
export const EyeIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
export const EyeOffIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M3 3l18 18M10.6 5.1A9.7 9.7 0 0112 5c6 0 10 7 10 7a17 17 0 01-3.2 3.9M6.2 6.2A17 17 0 002 12s4 7 10 7a9.6 9.6 0 004-.9" />
  </svg>
);
export const ChevronLeftIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M15 5l-7 7 7 7" />
  </svg>
);
export const ChevronRightIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M9 5l7 7-7 7" />
  </svg>
);
export const PauseIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M8 5v14M16 5v14" />
  </svg>
);
export const PlayIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M7 4l13 8-13 8z" />
  </svg>
);
export const AccessIcon = (p) => (
  <svg {...base} width={26} height={26} strokeWidth={1.8} {...p}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="7.5" r="1.2" />
    <path d="M7 10.5l5 1.2 5-1.2M12 11.7V16m0 0l-2.5 4M12 16l2.5 4" />
  </svg>
);
export const GoogleIcon = (p) => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...p}>
    <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.8-5.5 3.8a6 6 0 010-12c1.9 0 3.2.8 3.9 1.5l2.7-2.6A9.6 9.6 0 0012 2.4a9.6 9.6 0 100 19.2c5.5 0 9.2-3.9 9.2-9.3 0-.6-.1-1.1-.2-1.6z" />
  </svg>
);
export const MicrosoftIcon = (p) => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...p}>
    <path fill="#F25022" d="M3 3h8.5v8.5H3z" />
    <path fill="#7FBA00" d="M12.5 3H21v8.5h-8.5z" />
    <path fill="#00A4EF" d="M3 12.5h8.5V21H3z" />
    <path fill="#FFB900" d="M12.5 12.5H21V21h-8.5z" />
  </svg>
);
export const AppleIcon = (p) => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...p}>
    <path
      fill="currentColor"
      d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9s-1.8-.8-3-.8c-1.5 0-3 .9-3.800 2.300-1.600 2.800-.4 6.900 1.200 9.200.8 1.100 1.700 2.400 2.900 2.300 1.200 0 1.600-.7 3-.7s1.800.7 3 .7c1.300 0 2.100-1.100 2.800-2.200.9-1.300 1.300-2.500 1.300-2.600-.1 0-2.500-1-2.500-3.800zM14.100 5.700c.6-.8 1.100-1.900.9-3-1 0-2.100.7-2.800 1.500-.6.700-1.100 1.800-1 2.900 1.100.1 2.200-.6 2.900-1.400z"
    />
  </svg>
);
