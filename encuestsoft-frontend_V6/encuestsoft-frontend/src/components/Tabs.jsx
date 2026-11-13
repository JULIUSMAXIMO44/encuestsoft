import { useId, useRef } from 'react';

// Pestañas accesibles (flechas, Inicio y Fin). tabs: [{ id, label, count? }]
export default function Tabs({ tabs, value, onChange, children }) {
  const base = useId();
  const refs = useRef({});

  const onKeyDown = (e) => {
    const i = tabs.findIndex((t) => t.id === value);
    let next = null;
    if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
    if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = tabs.length - 1;
    if (next === null) return;
    e.preventDefault();
    onChange(tabs[next].id);
    refs.current[tabs[next].id]?.focus();
  };

  return (
    <div>
      <div className="tabs" role="tablist" aria-label="Secciones" onKeyDown={onKeyDown}>
        {tabs.map((t) => (
          <button
            key={t.id}
            ref={(el) => (refs.current[t.id] = el)}
            type="button"
            role="tab"
            id={`${base}-tab-${t.id}`}
            aria-selected={value === t.id}
            aria-controls={`${base}-panel-${t.id}`}
            tabIndex={value === t.id ? 0 : -1}
            className="tab"
            onClick={() => onChange(t.id)}
          >
            {t.icon}
            {t.label}
            {typeof t.count === 'number' && <span className="tab-count">{t.count}</span>}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`${base}-panel-${value}`} aria-labelledby={`${base}-tab-${value}`} tabIndex="0">
        {children}
      </div>
    </div>
  );
}
