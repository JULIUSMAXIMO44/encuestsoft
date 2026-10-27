import React from 'react';

/**
 * Gráfico de barras horizontal accesible: los valores y porcentajes se muestran como
 * texto (no solo con la barra), por lo que lectores de pantalla y usuarios daltónicos
 * obtienen la misma información. La barra es decorativa (aria-hidden).
 * @param {{ items: Array<{label: string, value: number}>, label: string }} props
 */
export default function BarList({ items, label }) {
  const total = items.reduce((s, i) => s + i.value, 0) || 1;
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <ul className="bar-list list-unstyled mb-0" aria-label={label}>
      {items.map((i) => (
        <li key={i.label} className="mb-2">
          <div className="d-flex justify-content-between small">
            <span>{i.label || '(vacío)'}</span>
            <strong>{i.value} · {Math.round((i.value / total) * 100)}%</strong>
          </div>
          <div className="bar-track" aria-hidden="true"><div className="bar-fill" style={{ width: `${(i.value / max) * 100}%` }}></div></div>
        </li>
      ))}
    </ul>
  );
}
