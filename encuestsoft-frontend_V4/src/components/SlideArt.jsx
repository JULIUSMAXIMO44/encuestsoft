// Ilustraciones de las diapositivas (SVG propio, decorativas).
const art = { 'aria-hidden': 'true', focusable: 'false' };

export function FormMock() {
  return (
    <svg viewBox="0 0 200 150" className="form-mock" {...art}>
      <circle cx="150" cy="40" r="22" fill="#fff" opacity=".22" />
      <circle cx="182" cy="96" r="14" fill="#fff" opacity=".22" />
      <circle cx="132" cy="104" r="9" fill="#F5C400" />
      <text x="132" y="108" textAnchor="middle" fontSize="10" fontWeight="700" fill="#1b1b1b">%</text>
      <rect x="22" y="14" width="96" height="104" rx="8" fill="#fff" />
      <rect x="32" y="24" width="52" height="5" rx="2.5" fill="#3F6A9E" />
      <rect x="32" y="34" width="30" height="3" rx="1.5" fill="#b9c4d0" />
      {[50, 66, 82].map((y, i) => (
        <g key={y}>
          <rect x="30" y={y} width="80" height="12" rx="3" fill="#eef1f4" />
          <circle cx="37" cy={y + 6} r="3" fill={['#1d8239', '#1d8239', '#F5C400'][i]} />
          <rect x="45" y={y + 4} width={[48, 34, 50][i]} height="4" rx="2" fill="#b9c4d0" />
        </g>
      ))}
      <rect x="32" y="102" width="46" height="10" rx="5" fill="#1d8239" />
      <text x="55" y="109.500" textAnchor="middle" fontSize="6" fontWeight="700" fill="#fff">Enviar</text>
    </svg>
  );
}

export function PencilArt() {
  return (
    <svg viewBox="0 0 120 120" {...art}>
      <path d="M24 96l6-24 46-46a8 8 0 0111 0l7 7a8 8 0 010 11L48 90z" fill="#3A6EA5" />
      <path d="M24 96l6-24 18 18z" fill="#254B75" />
      <path d="M70 32l18 18" stroke="#fff" strokeWidth="4" />
    </svg>
  );
}

export function MagnifierArt() {
  return (
    <svg viewBox="0 0 120 120" {...art}>
      <circle cx="52" cy="52" r="30" fill="#5BB7A5" />
      <circle cx="52" cy="52" r="20" fill="#F4F7F7" stroke="#1F1F1F" strokeWidth="6" />
      <path d="M74 74l26 26" stroke="#1F1F1F" strokeWidth="10" strokeLinecap="round" />
    </svg>
  );
}

export function ShareArt() {
  return (
    <svg viewBox="0 0 120 120" {...art}>
      <circle cx="30" cy="60" r="12" fill="#111" />
      <circle cx="86" cy="28" r="12" fill="#111" />
      <circle cx="86" cy="92" r="12" fill="#111" />
      <path d="M40 54l36-20M40 66l36 20" stroke="#111" strokeWidth="6" />
    </svg>
  );
}
