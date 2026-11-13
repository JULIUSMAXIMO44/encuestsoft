import { useRef, useState } from 'react';
import { ALL_ITEMS, itemKey } from '../../builder/catalog.js';
import { bgCss, itemOf } from '../../builder/model.js';
import FieldPreview from './FieldPreview.jsx';
import { ChevronDownIcon, CopyIcon, TrashIcon, PlusIcon } from '../Icons.jsx';

const SIZES = { small: '32rem', medium: '42rem', large: '56rem' };

// Lienzo central: el formulario inicia en blanco. Acepta elementos nuevos
// arrastrados desde la paleta y reordena los existentes (arrastrar o botones).
export default function Canvas({ b }) {
  const { fields, design, settings, selected, setSelected } = b;
  const [over, setOver] = useState(null); // índice de inserción
  const [dragFrom, setDragFrom] = useState(null);
  const fileRef = useRef(null);
  const [logoError, setLogoError] = useState('');

  const style = {
    '--q-color': design.questionColor,
    '--t-color': design.textColor,
    '--f-bg': design.backgroundColor,
    '--err': design.errorColor,
    '--req': design.requiredColor,
    '--radius': `${design.radius}px`,
    '--q-size': `${design.questionSize}px`,
    fontFamily: `${design.fontFamily}, system-ui, sans-serif`,
  };
  const justify = { left: 'flex-start', center: 'center', right: 'flex-end' }[design.hPos];
  const align = { top: 'flex-start', middle: 'center', bottom: 'flex-end' }[design.vPos];

  const dropAt = (e, index) => {
    e.preventDefault();
    const newKey = e.dataTransfer.getData('application/x-es-new');
    if (newKey) {
      const item = ALL_ITEMS.find((i) => itemKey(i) === newKey);
      if (item) b.addField(item, index);
    } else if (dragFrom !== null) {
      b.moveField(dragFrom, index);
    }
    setOver(null);
    setDragFrom(null);
  };

  const onOverField = (e, i) => {
    e.preventDefault();
    const r = e.currentTarget.getBoundingClientRect();
    setOver(e.clientY < r.top + r.height / 2 ? i : i + 1);
  };

  const pickLogo = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!/^image\//.test(file.type)) return setLogoError('Elige un archivo de imagen.');
    if (file.size > 500 * 1024) return setLogoError('El logo debe pesar menos de 500 KB.');
    setLogoError('');
    const reader = new FileReader();
    reader.onload = () => b.updateDesign({ logo: reader.result });
    reader.readAsDataURL(file);
  };

  return (
    <div className="b-stage" style={bgCss(design.pageBg)}>
      <div className="b-stage-inner" style={{ justifyContent: justify, alignItems: align }}>
        <div className="b-form" style={{ ...style, ...bgCss(design.formBg), width: `min(100%, ${SIZES[design.size]})` }}>
          {/* Inicio del formulario: logo y página de bienvenida */}
          <div className="b-top">
            {design.logo ? (
              <div className="b-logo">
                <img src={design.logo} alt="Logo del formulario" />
                <button type="button" className="link-btn" onClick={() => b.updateDesign({ logo: '' })}>
                  Quitar logo
                </button>
              </div>
            ) : (
              <button type="button" className="b-ghost" onClick={() => fileRef.current?.click()}>
                <PlusIcon width={14} height={14} /> Agrega tu logo
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickLogo} aria-label="Elegir imagen del logo" />
            {logoError && <p className="b-err" role="alert">{logoError}</p>}
            {settings.welcome.enabled ? (
              <div className="b-welcome">
                <strong>Página de bienvenida</strong>
                <span>{settings.welcome.title}</span>
                <button type="button" className="link-btn" onClick={() => b.updateSettings({ welcome: { ...settings.welcome, enabled: false } })}>
                  Quitar página de bienvenida
                </button>
              </div>
            ) : (
              <button type="button" className="b-ghost" onClick={() => b.updateSettings({ welcome: { ...settings.welcome, enabled: true } })}>
                <PlusIcon width={14} height={14} /> Añadir página de bienvenida
              </button>
            )}
          </div>

          <h1 className="b-form-title">{b.form.title}</h1>
          {b.form.description && <p className="b-form-desc">{b.form.description}</p>}

          <div
            className="b-fields"
            onDragOver={(e) => {
              if (!fields.length) {
                e.preventDefault();
                setOver(0);
              }
            }}
            onDrop={(e) => !fields.length && dropAt(e, 0)}
            onDragLeave={(e) => !e.currentTarget.contains(e.relatedTarget) && setOver(null)}
          >
            {fields.length === 0 && (
              <div className={`b-empty${over === 0 ? ' is-over' : ''}`}>
                <p>
                  <strong>Tu formulario está en blanco.</strong>
                </p>
                <p>Arrastra un elemento desde el panel izquierdo hasta aquí, o haz clic en él para agregarlo.</p>
              </div>
            )}
            {fields.map((f, i) => {
              const item = itemOf(f);
              return (
                <div
                  key={f.cid}
                  className={`b-item w-${f.width || 'full'}${selected === f.cid ? ' is-selected' : ''}${over === i ? ' drop-before' : ''}${over === i + 1 && i === fields.length - 1 ? ' drop-after' : ''}${dragFrom === i ? ' is-dragging' : ''}`}
                  onDragOver={(e) => onOverField(e, i)}
                  onDrop={(e) => dropAt(e, over ?? i)}
                >
                  <div
                    className="b-card"
                    role="button"
                    tabIndex="0"
                    aria-pressed={selected === f.cid}
                    aria-label={`${item?.label || f.field_type}: ${f.label}. Pulsa Intro para editar propiedades.`}
                    onClick={() => setSelected(f.cid)}
                    onKeyDown={(e) => {
                      if (e.target !== e.currentTarget) return;
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelected(f.cid);
                      }
                      if (e.altKey && e.key === 'ArrowUp') {
                        e.preventDefault();
                        b.nudge(f.cid, -1);
                      }
                      if (e.altKey && e.key === 'ArrowDown') {
                        e.preventDefault();
                        b.nudge(f.cid, 1);
                      }
                      if (e.key === 'Delete') b.removeField(f.cid);
                    }}
                  >
                    <span
                      className="b-handle"
                      draggable
                      title="Arrastra para reordenar"
                      aria-hidden="true"
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('text/plain', f.cid);
                        setDragFrom(i);
                      }}
                      onDragEnd={() => {
                        setDragFrom(null);
                        setOver(null);
                      }}
                    >
                      ⠿
                    </span>
                    <FieldPreview field={f} />
                    {selected === f.cid && (
                      <div className="b-tools" role="toolbar" aria-label={`Acciones de ${f.label}`}>
                        <button type="button" className="icon-plain" onClick={(e) => { e.stopPropagation(); b.nudge(f.cid, -1); }} disabled={i === 0} aria-label="Mover arriba">
                          <ChevronDownIcon width={16} height={16} style={{ transform: 'rotate(180deg)' }} />
                        </button>
                        <button type="button" className="icon-plain" onClick={(e) => { e.stopPropagation(); b.nudge(f.cid, 1); }} disabled={i === fields.length - 1} aria-label="Mover abajo">
                          <ChevronDownIcon width={16} height={16} />
                        </button>
                        <button type="button" className="icon-plain" onClick={(e) => { e.stopPropagation(); b.duplicateField(f.cid); }} aria-label="Duplicar campo">
                          <CopyIcon width={16} height={16} />
                        </button>
                        <button type="button" className="icon-plain is-danger" onClick={(e) => { e.stopPropagation(); b.removeField(f.cid); }} aria-label="Eliminar campo">
                          <TrashIcon width={16} height={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {fields.length > 0 && (
            <div className="b-submit-row" style={{ justifyContent: { left: 'flex-start', center: 'center', right: 'flex-end' }[settings.button.align] }}>
              <span
                className={`b-submit is-${settings.button.style} s-${settings.button.size}${settings.button.width === 'full' ? ' is-full' : ''}`}
                style={{ '--btn': settings.button.color }}
              >
                {settings.button.icon !== 'none' && settings.button.iconPos === 'left' && <span aria-hidden="true">{ICONS[settings.button.icon]} </span>}
                {settings.button.text || 'Enviar'}
                {settings.button.icon !== 'none' && settings.button.iconPos === 'right' && <span aria-hidden="true"> {ICONS[settings.button.icon]}</span>}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const ICONS = { send: '➤', check: '✔', arrow: '→', none: '' };
