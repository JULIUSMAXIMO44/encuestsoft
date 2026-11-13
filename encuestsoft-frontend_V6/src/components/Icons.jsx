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

const mk = (d) => (p) => (
  <svg {...base} {...p}>
    {d}
  </svg>
);
export const PlusIcon = mk(<path d="M12 5v14M5 12h14" />);
export const PencilIcon = mk(<path d="M4 20l1-4L16.500 4.500a2 2 0 013 3L8 19zM14 7l3 3" />);
export const ShareIcon = mk(<path d="M18 8a3 3 0 100-6 3 3 0 000 6zM6 15a3 3 0 100-6 3 3 0 000 6zM18 22a3 3 0 100-6 3 3 0 000 6zM8.600 13.500l6.800 4M15.400 6.500l-6.800 4" />);
export const GearIcon = mk(
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.400 15a1.700 1.700 0 00.300 1.800l.1.100a2 2 0 11-2.800 2.800l-.1-.1a1.700 1.700 0 00-1.800-.3 1.700 1.700 0 00-1 1.500V21a2 2 0 11-4 0v-.1a1.700 1.700 0 00-1.100-1.500 1.700 1.700 0 00-1.800.3l-.1.100a2 2 0 11-2.800-2.800l.1-.1a1.700 1.700 0 00.3-1.800 1.700 1.700 0 00-1.500-1H3a2 2 0 110-4h.1a1.700 1.700 0 001.500-1.100 1.700 1.700 0 00-.3-1.800l-.1-.1a2 2 0 112.800-2.800l.1.100a1.700 1.700 0 001.800.3H9a1.700 1.700 0 001-1.500V3a2 2 0 114 0v.1a1.700 1.700 0 001 1.500 1.700 1.700 0 001.800-.3l.1-.1a2 2 0 112.800 2.800l-.1.100a1.700 1.700 0 00-.3 1.800V9a1.700 1.700 0 001.500 1H21a2 2 0 110 4h-.1a1.700 1.700 0 00-1.500 1z" />
  </>
);
export const CopyIcon = mk(
  <>
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15V5a2 2 0 012-2h10" />
  </>
);
export const TrashIcon = mk(<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />);
export const ListIcon = mk(<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />);
export const ReportIcon = mk(
  <>
    <path d="M6 3h9l4 4v14H6z" />
    <path d="M9 17v-3M12 17v-6M15 17v-4" />
  </>
);
export const PieIcon = mk(
  <>
    <path d="M12 3v9h9" />
    <path d="M20.500 15A9 9 0 1112 3" />
  </>
);
export const BellIcon = mk(<path d="M6 17V11a6 6 0 1112 0v6l2 2H4zM10 21a2 2 0 004 0" />);
export const SparkleIcon = mk(<path d="M12 3l1.800 5.200L19 10l-5.200 1.800L12 17l-1.800-5.200L5 10l5.200-1.800zM19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" />);
export const ChevronDownIcon = mk(<path d="M6 9l6 6 6-6" />);
export const MenuIcon = mk(<path d="M4 6h16M4 12h16M4 18h16" />);
export const SearchIcon = mk(
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.500-3.500" />
  </>
);
export const FilePdfIcon = mk(
  <>
    <path d="M6 3h9l4 4v14H6z" />
    <path d="M9 15h1.500a1.500 1.500 0 000-3H9v5" />
  </>
);
export const HelpIcon = mk(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.500 9.500a2.500 2.500 0 114 2c-.9.600-1.500 1-1.500 2M12 17h.01" />
  </>
);
export const BuildingIcon = mk(<path d="M4 21V5l8-2v18M12 8h8v13M4 21h16M8 8h.01M8 12h.01M8 16h.01M16 12h.01M16 16h.01" />);
export const CheckIcon = mk(<path d="M5 12.500l4.500 4.500L19 7.500" />);
export const LogoutIcon = mk(<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />);
export const UserIcon = mk(
  <>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.500-6 8-6s8 2 8 6" />
  </>
);
export const CardIcon = mk(
  <>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 10h18" />
  </>
);
export const PuzzleIcon = mk(<path d="M10 4a2 2 0 114 0v2h4v4h-2a2 2 0 100 4h2v4h-4v-2a2 2 0 10-4 0v2H6v-4h2a2 2 0 100-4H6V6h4z" />);
export const WandIcon = mk(<path d="M5 19L17 7M14 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1zM19 12l.6 1.400L21 14l-1.400.6L19 16l-.6-1.400L17 14l1.400-.6z" />);
export const FileIcon = mk(<path d="M6 3h9l4 4v14H6zM14 3v5h5" />);
export const LayoutIcon = mk(
  <>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M3 10h18M10 10v10" />
  </>
);
export const CloseIcon = mk(<path d="M6 6l12 12M18 6L6 18" />);
export const SortIcon = mk(<path d="M8 9l4-4 4 4M8 15l4 4 4-4" />);
export const InboxIcon = mk(<path d="M3 13l3-8h12l3 8v6H3zM3 13h5l1 3h6l1-3h5" />);
export const MessageIcon = mk(<path d="M4 5h16v11H9l-5 4z" />);
export const MapIcon = mk(<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14" />);

export const NotebookIcon = mk(<path d="M6 3h12v18H6zM9 3v18M12 8h3M12 12h3" />);
export const HandPointIcon = mk(<path d="M9 11V5a1.5 1.5 0 013 0v5m0-1.500a1.500 1.500 0 013 0V11m0-1a1.500 1.500 0 013 0v5a6 6 0 01-6 6h-1.500a5 5 0 01-4-2L4 14.500a1.500 1.500 0 012.300-1.800L9 15" />);
export const ContrastIcon = mk(<><circle cx="12" cy="12" r="9" /><path d="M12 3v18a9 9 0 000-18z" fill="currentColor" /></>);
export const BookOpenIcon = mk(<path d="M2 5h7a3 3 0 013 3v12a2 2 0 00-2-2H2zM22 5h-7a3 3 0 00-3 3v12a2 2 0 012-2h8z" />);
export const EarIcon = mk(<path d="M7 9a5 5 0 0110 0c0 2.500-2 3.500-3 5s-.5 4-3 4a3 3 0 01-3-3M10 9a2 2 0 014 0" />);
export const ResetIcon = mk(<path d="M4 12a8 8 0 108-8 8 8 0 00-5.700 2.400L4 9M4 4v5h5" />);
export const LinkIcon = mk(<path d="M10 14a4 4 0 005.700 0l3-3a4 4 0 00-5.700-5.700l-1 1M14 10a4 4 0 00-5.700 0l-3 3a4 4 0 005.700 5.700l1-1" />);
export const SpacingIcon = mk(<path d="M4 4h16M4 20h16M12 8v8M9 11l3-3 3 3M9 13l3 3 3-3" />);
export const MotionIcon = mk(<><circle cx="12" cy="12" r="9" /><path d="M9 9v6M15 9v6" /></>);
export const TypeIcon = mk(<path d="M5 6V4h14v2M12 4v16M9 20h6" />);
