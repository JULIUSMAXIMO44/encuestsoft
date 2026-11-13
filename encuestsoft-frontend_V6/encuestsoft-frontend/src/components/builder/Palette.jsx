import { useState } from 'react';
import { CATEGORIES, itemKey } from '../../builder/catalog.js';
import { ChevronDownIcon } from '../Icons.jsx';

// Panel izquierdo: elementos por categorías. Se pueden arrastrar al lienzo
// o agregar con el botón (alternativa para teclado y lectores de pantalla).
export default function Palette({ onAdd }) {
  const [closed, setClosed] = useState({});
  return (
    <aside className="b-palette" aria-label="Elementos del formulario">
      <h2 className="b-title">Elementos</h2>
      {CATEGORIES.map((cat) => {
        const open = !closed[cat.id];
        return (
          <section key={cat.id} className="pal-cat">
            <button
              type="button"
              className="pal-head"
              aria-expanded={open}
              aria-controls={`pal-${cat.id}`}
              onClick={() => setClosed((c) => ({ ...c, [cat.id]: open }))}
            >
              {cat.label}
              <ChevronDownIcon width={14} height={14} className={`chev${open ? ' is-open' : ''}`} />
            </button>
            {open && (
              <ul id={`pal-${cat.id}`} className="pal-list">
                {cat.items.map((it) => (
                  <li key={itemKey(it)}>
                    <button
                      type="button"
                      className="pal-item"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('application/x-es-new', itemKey(it));
                        e.dataTransfer.effectAllowed = 'copy';
                      }}
                      onClick={() => onAdd(it)}
                      aria-label={`Agregar ${it.label}`}
                      title="Clic para agregar o arrastrar al formulario"
                    >
                      <span className="pal-icon" aria-hidden="true">{it.icon}</span>
                      {it.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </aside>
  );
}
