import { useId } from 'react';
import { DEFAULT_DESIGN, FONTS, GRADIENTS, SCHEMES, contrast } from '../../builder/model.js';

function Color({ label, value, onChange }) {
  const id = useId();
  return (
    <div className="prop color-row">
      <label htmlFor={id}>{label}</label>
      <span className="color-pair">
        <input id={id} type="color" value={value} onChange={(e) => onChange(e.target.value)} />
        <input type="text" aria-label={`${label}, código hexadecimal`} value={value} onChange={(e) => /^#[0-9a-fA-F]{0,6}$/.test(e.target.value) && onChange(e.target.value)} maxLength={7} />
      </span>
    </div>
  );
}

function Background({ title, value, onChange }) {
  const set = (patch) => onChange({ ...value, ...patch });
  const pickImage = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || file.size > 800 * 1024) return;
    const r = new FileReader();
    r.onload = () => set({ type: 'image', image: r.result });
    r.readAsDataURL(file);
  };
  return (
    <fieldset className="prop">
      <legend>{title}</legend>
      <div className="seg" role="radiogroup" aria-label={`Tipo de fondo: ${title}`}>
        {[['solid', 'Sólido'], ['gradient', 'Gradiente'], ['image', 'Imagen'], ['transparent', 'Transparente']].map(([k, l]) => (
          <label key={k} className={value.type === k ? 'is-on' : ''}>
            <input type="radio" name={title} checked={value.type === k} onChange={() => set({ type: k })} /> {l}
          </label>
        ))}
      </div>
      {value.type === 'solid' && <Color label="Color" value={value.color} onChange={(color) => set({ color })} />}
      {value.type === 'gradient' && (
        <>
          <div className="swatches" role="group" aria-label="Gradientes predefinidos">
            {GRADIENTS.map(([n, a, b]) => (
              <button key={n} type="button" className="swatch" title={n} aria-label={`Gradiente ${n}`} style={{ background: `linear-gradient(135deg, ${a}, ${b})` }} onClick={() => set({ from: a, to: b })} />
            ))}
          </div>
          <Color label="Color inicial" value={value.from} onChange={(from) => set({ from })} />
          <Color label="Color final" value={value.to} onChange={(to) => set({ to })} />
          <div className="prop">
            <label>Dirección</label>
            <select aria-label={`Dirección del gradiente: ${title}`} value={value.direction} onChange={(e) => set({ direction: e.target.value })}>
              <option value="180deg">Arriba → abajo</option>
              <option value="0deg">Abajo → arriba</option>
              <option value="90deg">Izquierda → derecha</option>
              <option value="270deg">Derecha → izquierda</option>
              <option value="135deg">Diagonal</option>
            </select>
          </div>
        </>
      )}
      {value.type === 'image' && (
        <div className="prop">
          <label>Imagen (máx. 800 KB)</label>
          <input type="file" accept="image/*" onChange={pickImage} aria-label={`Elegir imagen de fondo: ${title}`} />
          {value.image && <button type="button" className="link-btn" onClick={() => set({ image: '', type: 'solid' })}>Quitar imagen</button>}
        </div>
      )}
    </fieldset>
  );
}

// Pestaña Diseño: los cambios se ven al instante en el lienzo.
export default function DesignPanel({ b }) {
  const d = b.design;
  const ratio = contrast(d.textColor, d.backgroundColor);
  const ratioQ = contrast(d.questionColor, d.formBg.type === 'solid' ? d.formBg.color : '#ffffff');
  const applyScheme = (key) => {
    const s = SCHEMES[key];
    b.updateDesign({
      scheme: key, questionColor: s.q, textColor: s.t, backgroundColor: s.f,
      pageBg: { ...d.pageBg, type: 'solid', color: s.page }, formBg: { ...d.formBg, type: 'solid', color: s.form },
    });
  };
  return (
    <aside className="b-props" aria-label="Diseño del formulario">
      <h2 className="b-title">Diseño</h2>

      <details open className="prop-sec">
        <summary>Colores</summary>
        <div className="prop">
          <label htmlFor="d-scheme">Esquema de color</label>
          <select id="d-scheme" value={d.scheme} onChange={(e) => applyScheme(e.target.value)}>
            {Object.entries(SCHEMES).map(([k, s]) => (
              <option key={k} value={k}>{s.label}</option>
            ))}
            <option value="personalizado" disabled>Personalizado</option>
          </select>
        </div>
        <Color label="Color de las preguntas" value={d.questionColor} onChange={(v) => b.updateDesign({ questionColor: v, scheme: 'personalizado' })} />
        <Color label="Color del texto" value={d.textColor} onChange={(v) => b.updateDesign({ textColor: v, scheme: 'personalizado' })} />
        <Color label="Fondo del campo" value={d.backgroundColor} onChange={(v) => b.updateDesign({ backgroundColor: v, scheme: 'personalizado' })} />
        <Color label="Mensaje de error" value={d.errorColor} onChange={(v) => b.updateDesign({ errorColor: v })} />
        <Color label="Asterisco de obligatorio" value={d.requiredColor} onChange={(v) => b.updateDesign({ requiredColor: v })} />
        {ratio !== null && ratio < 4.5 && (
          <p className="b-warn" role="status">El contraste del texto sobre el fondo del campo es {ratio.toFixed(2)}:1; el mínimo recomendado (WCAG AA) es 4.5:1.</p>
        )}
        {ratioQ !== null && ratioQ < 4.5 && (
          <p className="b-warn" role="status">El contraste de las preguntas sobre el fondo del formulario es {ratioQ.toFixed(2)}:1; el mínimo recomendado es 4.5:1.</p>
        )}
      </details>

      <details className="prop-sec">
        <summary>Fondo</summary>
        <Background title="Fondo de la página" value={d.pageBg} onChange={(pageBg) => b.updateDesign({ pageBg })} />
        <Background title="Fondo del formulario" value={d.formBg} onChange={(formBg) => b.updateDesign({ formBg })} />
      </details>

      <details className="prop-sec">
        <summary>Tipografía</summary>
        <div className="prop">
          <label htmlFor="d-font">Fuente</label>
          <select id="d-font" value={d.fontFamily} onChange={(e) => b.updateDesign({ fontFamily: e.target.value })}>
            {FONTS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
        <div className="prop">
          <label htmlFor="d-qs">Tamaño de las preguntas: {d.questionSize} px</label>
          <input id="d-qs" type="range" min="12" max="24" value={d.questionSize} onChange={(e) => b.updateDesign({ questionSize: Number(e.target.value) })} />
        </div>
      </details>

      <details className="prop-sec">
        <summary>Diseño y espaciado</summary>
        <div className="prop">
          <label htmlFor="d-rad">Redondeo de esquinas: {d.radius} px</label>
          <input id="d-rad" type="range" min="0" max="24" value={d.radius} onChange={(e) => b.updateDesign({ radius: Number(e.target.value) })} />
        </div>
        <div className="prop">
          <label htmlFor="d-size">Tamaño del formulario</label>
          <select id="d-size" value={d.size} onChange={(e) => b.updateDesign({ size: e.target.value })}>
            <option value="small">Pequeño</option>
            <option value="medium">Mediano</option>
            <option value="large">Grande</option>
          </select>
        </div>
        <div className="prop-grid">
          <div className="prop">
            <label htmlFor="d-h">Posición horizontal</label>
            <select id="d-h" value={d.hPos} onChange={(e) => b.updateDesign({ hPos: e.target.value })}>
              <option value="left">Izquierda</option>
              <option value="center">Centro</option>
              <option value="right">Derecha</option>
            </select>
          </div>
          <div className="prop">
            <label htmlFor="d-v">Posición vertical</label>
            <select id="d-v" value={d.vPos} onChange={(e) => b.updateDesign({ vPos: e.target.value })}>
              <option value="top">Arriba</option>
              <option value="middle">Centro</option>
              <option value="bottom">Abajo</option>
            </select>
          </div>
        </div>
      </details>

      <details className="prop-sec">
        <summary>Avanzado</summary>
        <p className="b-hint">El logo se agrega desde el inicio del formulario, en la pestaña Constructor.</p>
        {d.logo && <button type="button" className="btn btn-outline btn-sm" onClick={() => b.updateDesign({ logo: '' })}>Quitar logo</button>}
      </details>

      <button type="button" className="btn btn-outline btn-sm" onClick={() => b.updateDesign({ ...DEFAULT_DESIGN, logo: d.logo })}>
        Restablecer valores predeterminados
      </button>
    </aside>
  );
}
