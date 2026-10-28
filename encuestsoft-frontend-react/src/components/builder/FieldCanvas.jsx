import React, { useState } from 'react';
import { getFieldType } from '../../utils/fieldTypes.js';

/** Zona donde se puede soltar un campo (entre tarjetas). */
function DropZone({ index, onDropAt, isFirstAndEmpty }) {
  const [over, setOver] = useState(false);
  return (
    <div
      className={`drop-zone${over ? ' over' : ''}${isFirstAndEmpty ? ' empty' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        onDropAt(index, { newType: e.dataTransfer.getData('application/x-new-field'), moveFrom: e.dataTransfer.getData('application/x-move-field') });
      }}
    >
      {isFirstAndEmpty && <span>Suelte aquí el primer campo o agréguelo desde la paleta.</span>}
    </div>
  );
}

/**
 * Lienzo del constructor: lista ordenada de campos con arrastrar-soltar,
 * botones Subir/Bajar (teclado), duplicar y eliminar.
 */
export default function FieldCanvas({ fields, selectedCid, onSelect, onDropAt, onMove, onDuplicate, onRemove }) {
  return (
    <section aria-labelledby="canvas-title" className="builder-panel">
      <h2 className="h6" id="canvas-title">Formulario ({fields.length} {fields.length === 1 ? 'campo' : 'campos'})</h2>
      <DropZone index={0} onDropAt={onDropAt} isFirstAndEmpty={fields.length === 0} />
      <ol className="list-unstyled mb-0">
        {fields.map((f, i) => {
          const t = getFieldType(f.field_type);
          const selected = f._cid === selectedCid;
          return (
            <li key={f._cid}>
              <article
                className={`field-card${selected ? ' selected' : ''}`}
                draggable
                onDragStart={(e) => { e.dataTransfer.setData('application/x-move-field', String(i)); e.dataTransfer.effectAllowed = 'move'; }}
                aria-current={selected ? 'true' : undefined}
              >
                <span className="drag-handle" aria-hidden="true" title="Arrastre para reordenar"><i className="bi bi-grip-vertical"></i></span>
                <button type="button" className="field-card-main" onClick={() => onSelect(f._cid, true)} aria-label={`Editar campo ${i + 1}: ${f.label}, tipo ${t.label}`}>
                  <i className={`bi ${t.icon} me-2`} aria-hidden="true"></i>
                  <strong>{f.label || '(sin título)'}</strong>
                  {f.is_required && <span className="badge text-bg-danger ms-2">Obligatorio</span>}
                  {f.conditional_logic_json?.rules?.length > 0 && <span className="badge text-bg-info ms-2">Condicional</span>}
                  <small className="d-block text-muted">{t.label}{f.step_number > 1 ? ` · Paso ${f.step_number}` : ''}</small>
                </button>
                <div className="field-card-actions" role="group" aria-label={`Acciones del campo ${f.label}`}>
                  <button type="button" className="action-btn" title="Subir" aria-label={`Subir ${f.label}`} disabled={i === 0} onClick={() => onMove(i, -1)}><i className="bi bi-arrow-up" aria-hidden="true"></i></button>
                  <button type="button" className="action-btn" title="Bajar" aria-label={`Bajar ${f.label}`} disabled={i === fields.length - 1} onClick={() => onMove(i, 1)}><i className="bi bi-arrow-down" aria-hidden="true"></i></button>
                  <button type="button" className="action-btn" title="Duplicar" aria-label={`Duplicar ${f.label}`} onClick={() => onDuplicate(i)}><i className="bi bi-copy" aria-hidden="true"></i></button>
                  <button type="button" className="action-btn action-delete" title="Eliminar" aria-label={`Eliminar ${f.label}`} onClick={() => onRemove(i)}><i className="bi bi-trash" aria-hidden="true"></i></button>
                </div>
              </article>
              <DropZone index={i + 1} onDropAt={onDropAt} />
            </li>
          );
        })}
      </ol>
    </section>
  );
}
