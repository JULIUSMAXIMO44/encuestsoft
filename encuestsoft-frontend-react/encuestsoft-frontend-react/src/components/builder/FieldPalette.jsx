import React from 'react';
import { FIELD_TYPES } from '../../utils/fieldTypes.js';

const GROUPS = ['Entrada', 'Selección', 'Otros', 'Diseño'];

/**
 * Paleta de tipos de campo. Cada tipo se puede ARRASTRAR al lienzo o AGREGAR con clic/Enter
 * (alternativa de teclado y táctil al arrastrar y soltar, requisito de accesibilidad WCAG 2.5.7).
 * @param {{ onAdd: (type: string) => void }} props
 */
export default function FieldPalette({ onAdd }) {
  return (
    <section aria-labelledby="palette-title" className="builder-panel">
      <h2 className="h6" id="palette-title">Tipos de campo</h2>
      <p className="small text-muted">Arrastre un tipo al formulario o pulse para agregarlo al final.</p>
      {GROUPS.map((group) => (
        <div key={group} className="mb-3" role="group" aria-label={group}>
          <p className="small fw-semibold mb-1">{group}</p>
          <div className="d-grid gap-1">
            {FIELD_TYPES.filter((t) => t.group === group).map((t) => (
              <button
                key={t.type}
                type="button"
                className="palette-item"
                draggable
                onDragStart={(e) => { e.dataTransfer.setData('application/x-new-field', t.type); e.dataTransfer.effectAllowed = 'copy'; }}
                onClick={() => onAdd(t.type)}
                aria-label={`Agregar campo ${t.label}`}
              >
                <i className={`bi ${t.icon} me-2`} aria-hidden="true"></i>{t.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
