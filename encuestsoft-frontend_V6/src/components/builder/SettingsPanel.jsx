import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { HAS_OPTIONS, OPERATORS, itemKey } from '../../builder/catalog.js';
import { newCid } from '../../builder/model.js';
import { PlusIcon, TrashIcon } from '../Icons.jsx';
import { ICONS } from './Canvas.jsx';

const SECTIONS = [
  ['general', 'General'],
  ['correo', 'Correo electrónico'],
  ['boton', 'Configuración del botón de envío'],
  ['condiciones', 'Condiciones'],
  ['enlace', 'Vista previa del enlace'],
  ['cierre', 'Fecha de cierre y límite de respuestas'],
  ['referencia', 'Referencia de envío del formulario'],
  ['quiz', 'Modo Quiz'],
  ['temporizador', 'Temporizador'],
  ['pdf', 'PDF'],
];

// ---------- piezas reutilizables ----------
function Group({ title, children, intro }) {
  return (
    <section className="set-group" aria-label={title}>
      <h3>{title}</h3>
      {intro && <p className="b-hint">{intro}</p>}
      {children}
    </section>
  );
}
function Toggle({ label, hint, checked, onChange, disabled }) {
  const id = useId();
  return (
    <div className="toggle-row">
      <span>
        <label htmlFor={id}>{label}</label>
        {hint && <span className="field-hint">{hint}</span>}
      </span>
      <input id={id} type="checkbox" role="switch" checked={Boolean(checked)} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
    </div>
  );
}
function Text({ label, hint, value, onChange, type = 'text', counter, ...rest }) {
  const id = useId();
  return (
    <div className="prop">
      <label htmlFor={id}>
        {label}
        {counter ? <span className="counter"> {String(value || '').length}/{counter}</span> : null}
      </label>
      <input id={id} type={type} value={value ?? ''} onChange={(e) => onChange(e.target.value)} maxLength={counter} {...rest} />
      {hint && <p className="field-hint">{hint}</p>}
    </div>
  );
}
function Area({ label, hint, value, onChange, rows = 3, counter }) {
  const id = useId();
  return (
    <div className="prop">
      <label htmlFor={id}>
        {label}
        {counter ? <span className="counter"> {String(value || '').length}/{counter}</span> : null}
      </label>
      <textarea id={id} rows={rows} value={value ?? ''} maxLength={counter} onChange={(e) => onChange(e.target.value)} />
      {hint && <p className="field-hint">{hint}</p>}
    </div>
  );
}
function Pick({ label, value, onChange, options, hint }) {
  const id = useId();
  return (
    <div className="prop">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
      {hint && <p className="field-hint">{hint}</p>}
    </div>
  );
}
const Soon = ({ children }) => <p className="soon">{children}</p>;

// ---------- secciones ----------
function General({ b }) {
  const { form, settings: s } = b;
  const [pwd, setPwd] = useState('');
  return (
    <>
      <Group title="Básico">
        <Text label="Nombre del formulario" value={form.title} onChange={(v) => b.updateForm({ title: v })} counter={200} />
        <Area label="Descripción" value={form.description || ''} onChange={(v) => b.updateForm({ description: v })} />
        <Pick label="Idioma del formulario" value={s.language} onChange={(v) => b.updateSettings({ language: v })} options={[['es', 'Español'], ['en', 'English'], ['fr', 'Français'], ['de', 'Deutsch'], ['nl', 'Nederlands']]} />
      </Group>
      <Group title="Experiencia del formulario">
        <Toggle label="Barra de progreso" hint="Muestra cuánto falta para terminar." checked={s.showProgress} onChange={(v) => b.updateSettings({ showProgress: v })} />
        <Toggle label="Botón para volver arriba" checked={s.scrollTop} onChange={(v) => b.updateSettings({ scrollTop: v })} />
        <Toggle label="Guardar progreso" hint="Quien responde puede continuar después." checked={s.saveProgress} onChange={(v) => b.updateSettings({ saveProgress: v })} />
        <Toggle label="Mostrar insignia de ENCUESTSOFT" checked={s.badge} onChange={(v) => b.updateSettings({ badge: v })} />
        <Toggle label="Rellenar campos desde la URL" hint="Usa parámetros como ?correo=…" checked={form.allow_prefill_from_url} onChange={(v) => b.updateForm({ allow_prefill_from_url: v })} />
      </Group>
      <Group title="Respuestas">
        <Toggle label="Permitir envíos parciales" hint="Guarda lo respondido aunque no se termine." checked={s.partialSubmissions} onChange={(v) => b.updateSettings({ partialSubmissions: v })} />
        <Toggle label="Verificar duplicados" hint="Una sola respuesta por persona." checked={form.limit_one_submission_per_user} onChange={(v) => b.updateForm({ limit_one_submission_per_user: v })} />
      </Group>
      <Group title="Después del envío">
        <Area label="Mensaje de éxito" value={form.success_message || ''} onChange={(v) => b.updateForm({ success_message: v })} rows={2} />
        <Area label="Mensaje de error" value={form.error_message || ''} onChange={(v) => b.updateForm({ error_message: v })} rows={2} />
        <Text label="Redirigir a esta dirección (opcional)" type="url" value={form.redirect_url || ''} onChange={(v) => b.updateForm({ redirect_url: v })} placeholder="https://" />
        <Text label="Segundos antes de redirigir" type="number" min="0" max="60" value={form.redirect_delay_seconds ?? 0} onChange={(v) => b.updateForm({ redirect_delay_seconds: Number(v) })} />
      </Group>
      <Group title="Seguridad y acceso">
        <Toggle label="Google reCAPTCHA" hint="Evita envíos automáticos." checked={form.recaptcha_enabled} onChange={(v) => b.updateForm({ recaptcha_enabled: v })} />
        {form.recaptcha_enabled && (
          <Pick label="Versión de reCAPTCHA" value={form.recaptcha_version || 'v2'} onChange={(v) => b.updateForm({ recaptcha_version: v })} options={[['v2', 'v2 (casilla «No soy un robot»)'], ['v3', 'v3 (invisible, por puntaje)']]} />
        )}
        <div className="prop">
          <label htmlFor="s-pwd">Protección con contraseña {form.is_password_protected && <span className="badge badge-published">Activa</span>}</label>
          <div className="inline">
            <input id="s-pwd" type="password" autoComplete="new-password" value={pwd} placeholder={form.is_password_protected ? 'Escribe una nueva para cambiarla' : 'Contraseña del formulario'} onChange={(e) => { setPwd(e.target.value); b.setPasswordDraft(e.target.value); }} />
            {form.is_password_protected && (
              <button type="button" className="btn btn-outline btn-sm" onClick={() => { setPwd(''); b.setPasswordDraft('\u0000'); }}>
                Quitar
              </button>
            )}
          </div>
          <p className="field-hint">Se aplica al pulsar Guardar.</p>
        </div>
        <Area label="Sitios web permitidos" hint="Un dominio por línea. Si queda vacío, el formulario se puede incrustar en cualquier sitio." value={s.allowedSites} onChange={(v) => b.updateSettings({ allowedSites: v })} />
      </Group>
    </>
  );
}

function Correo({ b }) {
  const { form, settings: s } = b;
  const emailFields = b.fields.filter((f) => f.field_type === 'email');
  const mr = s.mailRespondent;
  const setMR = (p) => b.updateSettings({ mailRespondent: { ...mr, ...p } });
  return (
    <>
      <Group title="Correo para mí" intro="Recibe un correo por cada respuesta.">
        <Toggle label="Enviarme un correo por cada respuesta" checked={form.notify_email_enabled} onChange={(v) => b.updateForm({ notify_email_enabled: v })} />
        {form.notify_email_enabled && <Area label="Direcciones de destino" hint="Separadas por comas." value={form.notify_emails || ''} onChange={(v) => b.updateForm({ notify_emails: v })} rows={2} />}
      </Group>
      <Group title="Correo para quien responde" intro="Confirmación, agradecimiento o copia de las respuestas.">
        <Toggle label="Enviar correo de confirmación" checked={form.autoresponder_enabled} onChange={(v) => b.updateForm({ autoresponder_enabled: v })} />
        {form.autoresponder_enabled && (
          <>
            <Pick
              label="Campo con el correo de quien responde"
              value={form.autoresponder_field_key || ''}
              onChange={(v) => b.updateForm({ autoresponder_field_key: v })}
              options={[['', emailFields.length ? 'Selecciona un campo…' : 'Agrega primero un campo de correo'], ...emailFields.map((f) => [f.field_key, f.label])]}
            />
            <Text label="Asunto" value={form.autoresponder_subject || ''} onChange={(v) => b.updateForm({ autoresponder_subject: v })} />
            <Area label="Mensaje" hint="Puedes usar las etiquetas de los campos, por ejemplo {{nombre}}." value={form.autoresponder_body || ''} onChange={(v) => b.updateForm({ autoresponder_body: v })} rows={5} />
            <Toggle label="Adjuntar PDF de la respuesta" hint="Requiere activar el PDF en su sección." checked={mr.attachPdf} onChange={(v) => setMR({ attachPdf: v })} />
          </>
        )}
      </Group>
      <Group title="Servidor de correo (SMTP)">
        <div className="seg" role="radiogroup" aria-label="Servidor SMTP">
          {[['platform', 'Usar el de la plataforma'], ['workspace', 'Elegir el del workspace'], ['custom', 'Añadir uno propio']].map(([k, l]) => (
            <label key={k} className={s.smtp === k ? 'is-on' : ''}>
              <input type="radio" name="smtp" checked={s.smtp === k} onChange={() => b.updateSettings({ smtp: k })} /> {l}
            </label>
          ))}
        </div>
        {s.smtp !== 'platform' && <Soon>La administración de servidores SMTP del workspace llega en la fase 10.</Soon>}
      </Group>
    </>
  );
}

function Boton({ b }) {
  const bt = b.settings.button;
  const set = (p) => b.updateSettings({ button: { ...bt, ...p } });
  const PALETTE = ['#1d8239', '#0a4a8a', '#b00020', '#6a1b9a', '#1b1b1b', '#f5c400'];
  return (
    <div className="btn-layout">
      <div className="btn-preview" aria-label="Vista previa del botón">
        <p className="b-hint">Vista previa</p>
        <div className="b-submit-row" style={{ justifyContent: { left: 'flex-start', center: 'center', right: 'flex-end' }[bt.align] }}>
          <span className={`b-submit is-${bt.style} s-${bt.size}${bt.width === 'full' ? ' is-full' : ''}`} style={{ '--btn': bt.color }}>
            {bt.icon !== 'none' && bt.iconPos === 'left' && <span aria-hidden="true">{ICONS[bt.icon]} </span>}
            {bt.text || 'Enviar'}
            {bt.icon !== 'none' && bt.iconPos === 'right' && <span aria-hidden="true"> {ICONS[bt.icon]}</span>}
          </span>
        </div>
      </div>
      <div>
        <Group title="Texto">
          <Text label="Texto del botón" value={bt.text} onChange={(v) => set({ text: v })} counter={40} />
          <Text label="Texto mientras se envía" value={bt.sendingText} onChange={(v) => set({ sendingText: v })} counter={40} />
        </Group>
        <Group title="Icono">
          <Pick label="Icono" value={bt.icon} onChange={(v) => set({ icon: v })} options={[['none', 'Sin icono'], ['send', 'Enviar ➤'], ['check', 'Visto ✔'], ['arrow', 'Flecha →']]} />
          <Pick label="Posición del icono" value={bt.iconPos} onChange={(v) => set({ iconPos: v })} options={[['left', 'Izquierda'], ['right', 'Derecha']]} />
        </Group>
        <Group title="Estilo y color">
          <Pick label="Estilo" value={bt.style} onChange={(v) => set({ style: v })} options={[['filled', 'Relleno'], ['outline', 'Contorno']]} />
          <div className="prop">
            <span className="lbl">Color</span>
            <div className="swatches" role="group" aria-label="Paleta de colores">
              {PALETTE.map((c) => (
                <button key={c} type="button" className={`swatch${bt.color === c ? ' is-on' : ''}`} style={{ background: c }} aria-label={`Color ${c}`} aria-pressed={bt.color === c} onClick={() => set({ color: c })} />
              ))}
              <input type="color" aria-label="Color personalizado" value={bt.color} onChange={(e) => set({ color: e.target.value })} />
            </div>
          </div>
        </Group>
        <Group title="Tamaño y posición">
          <Pick label="Tamaño" value={bt.size} onChange={(v) => set({ size: v })} options={[['small', 'Pequeño'], ['medium', 'Mediano'], ['large', 'Grande']]} />
          <Pick label="Ancho" value={bt.width} onChange={(v) => set({ width: v })} options={[['auto', 'Según el texto'], ['full', 'Todo el ancho']]} />
          <Pick label="Alineación" value={bt.align} onChange={(v) => set({ align: v })} options={[['left', 'Izquierda'], ['center', 'Centro'], ['right', 'Derecha']]} />
        </Group>
      </div>
    </div>
  );
}

function Condiciones({ b }) {
  const rules = b.settings.conditions;
  const keyed = b.fields.filter((f) => !['divider', 'recaptcha', 'heading', 'paragraph'].includes(f.field_type));
  const setRules = (next) => b.updateSettings({ conditions: next });
  const upd = (id, p) => setRules(rules.map((r) => (r.id === id ? { ...r, ...p } : r)));
  const opts = (placeholder) => [['', placeholder], ...keyed.map((f) => [f.field_key, f.label])];
  return (
    <Group title="Condiciones" intro="Reglas que muestran, ocultan o rellenan campos según las respuestas de otros campos. El servidor las vuelve a evaluar al recibir un envío.">
      {keyed.length < 2 && <Soon>Agrega al menos dos campos al formulario para crear reglas.</Soon>}
      <ul className="rules">
        {rules.map((r, i) => {
          const source = b.fields.find((f) => f.field_key === r.source);
          const sourceOpts = source && HAS_OPTIONS.includes(source.field_type) ? source.options_json : null;
          const noValue = r.operator === 'is_empty' || r.operator === 'is_not_empty';
          return (
            <li key={r.id} className="rule">
              <p className="rule-n">Regla {i + 1}</p>
              <div className="rule-grid">
                <Pick label="Acción" value={r.action} onChange={(v) => upd(r.id, { action: v })} options={[['show', 'Mostrar'], ['hide', 'Ocultar'], ['fill', 'Rellenar un campo']]} />
                <Pick label="Campo afectado" value={r.target} onChange={(v) => upd(r.id, { target: v })} options={opts('Elige un campo…')} />
                <Pick label="Cuando el campo" value={r.source} onChange={(v) => upd(r.id, { source: v, value: '' })} options={opts('Elige un campo…')} />
                <Pick label="Condición" value={r.operator} onChange={(v) => upd(r.id, { operator: v })} options={OPERATORS} />
                {!noValue &&
                  (sourceOpts ? (
                    <Pick label="Valor" value={r.value} onChange={(v) => upd(r.id, { value: v })} options={[['', 'Elige…'], ...sourceOpts.map((o) => [o.value, o.label])]} />
                  ) : (
                    <Text label="Valor" value={r.value} onChange={(v) => upd(r.id, { value: v })} />
                  ))}
                {r.action === 'fill' && <Text label="Rellenar con" value={r.fillValue || ''} onChange={(v) => upd(r.id, { fillValue: v })} />}
              </div>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setRules(rules.filter((x) => x.id !== r.id))}>
                <TrashIcon width={14} height={14} /> Eliminar regla
              </button>
            </li>
          );
        })}
      </ul>
      <button type="button" className="btn btn-primary btn-sm" onClick={() => setRules([...rules, { id: newCid(), action: 'show', target: '', source: '', operator: 'equals', value: '' }])}>
        <PlusIcon width={14} height={14} /> Añadir regla
      </button>
    </Group>
  );
}

function Enlace({ b }) {
  const lp = b.settings.linkPreview;
  const set = (p) => b.updateSettings({ linkPreview: { ...lp, ...p } });
  const pick = (k) => (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || file.size > 300 * 1024) return;
    const r = new FileReader();
    r.onload = () => set({ [k]: r.result });
    r.readAsDataURL(file);
  };
  return (
    <div className="btn-layout">
      <div className="btn-preview">
        <p className="b-hint">Así se verá al compartir el enlace (WhatsApp, Facebook, Google)</p>
        <div className="link-card">
          {lp.image ? <img src={lp.image} alt="" /> : <div className="link-ph" aria-hidden="true">Imagen</div>}
          <div>
            <strong>{lp.title || b.form.title}</strong>
            <span>{lp.description || b.form.description || 'Sin descripción'}</span>
          </div>
        </div>
      </div>
      <Group title="Vista previa del enlace">
        <Text label="Título" value={lp.title} onChange={(v) => set({ title: v })} counter={60} />
        <Area label="Descripción" value={lp.description} onChange={(v) => set({ description: v })} counter={160} rows={3} />
        <div className="prop">
          <label htmlFor="lp-img">Imagen de vista previa (máx. 300 KB)</label>
          <input id="lp-img" type="file" accept="image/*" onChange={pick('image')} />
          {lp.image && <button type="button" className="link-btn" onClick={() => set({ image: '' })}>Quitar imagen</button>}
        </div>
        <div className="prop">
          <label htmlFor="lp-fav">Favicon (máx. 300 KB)</label>
          <input id="lp-fav" type="file" accept="image/*" onChange={pick('favicon')} />
          {lp.favicon && <button type="button" className="link-btn" onClick={() => set({ favicon: '' })}>Quitar favicon</button>}
        </div>
      </Group>
    </div>
  );
}

function Cierre({ b }) {
  const f = b.form;
  return (
    <Group title="Fecha de cierre y límite de respuestas" intro="El formulario se abre y se cierra solo, por fecha o al llegar a un número de respuestas.">
      <Text label="Abrir el formulario el" type="datetime-local" value={f.opens_at || ''} onChange={(v) => b.updateForm({ opens_at: v })} />
      <Text label="Cerrar el formulario el" type="datetime-local" value={f.closes_at || ''} onChange={(v) => b.updateForm({ closes_at: v })} hint="La hora se guarda según tu zona horaria (UTC en el servidor, pendiente)." />
      <Text label="Cerrar al llegar a este número de respuestas" type="number" min="1" value={f.submission_limit ?? ''} placeholder="Sin límite" onChange={(v) => b.updateForm({ submission_limit: v === '' ? null : Number(v) })} />
    </Group>
  );
}

function Referencia({ b }) {
  const r = b.settings.reference;
  const set = (p) => {
    const next = { ...r, ...p };
    b.updateSettings({ reference: next });
    b.updateForm({ reference_id_prefix: next.prefix, reference_id_format: `{PREFIX}-{SEQ}${next.suffix || ''}` });
  };
  const example = `${r.prefix || ''}-${String(r.start).padStart(Number(r.length) || 1, '0')}${r.suffix || ''}`;
  return (
    <Group title="Referencia de envío" intro="Número único por respuesta. Se puede usar en el mensaje de agradecimiento, los correos y el PDF.">
      <div className="prop-grid">
        <Text label="Prefijo" value={r.prefix} onChange={(v) => set({ prefix: v })} counter={20} />
        <Text label="Sufijo" value={r.suffix} onChange={(v) => set({ suffix: v })} counter={20} />
        <Text label="Empezar en" type="number" min="0" value={r.start} onChange={(v) => set({ start: Number(v) })} />
        <Text label="Longitud del número" type="number" min="1" max="12" value={r.length} onChange={(v) => set({ length: Number(v) })} />
      </div>
      <p className="ref-example">Ejemplo: <strong>{example}</strong></p>
      <Soon>«Empezar en» y «Longitud» se guardan con el formulario; el servidor las aplicará en el ajuste de backend de esta fase.</Soon>
    </Group>
  );
}

function Quiz({ b }) {
  const q = b.settings.quiz;
  const set = (p) => b.updateSettings({ quiz: { ...q, ...p } });
  const gradable = b.fields.filter((f) => [...HAS_OPTIONS, 'text', 'number'].includes(f.field_type));
  const setQ = (cid, p) => {
    const f = b.fields.find((x) => x.cid === cid);
    const cur = f.custom_attributes_json?.quiz || { correct: [], points: 1 };
    b.updateField(cid, { custom_attributes_json: { ...f.custom_attributes_json, quiz: { ...cur, ...p } } });
  };
  return (
    <>
      <Group title="Modo Quiz" intro="Califica automáticamente cada respuesta.">
        <Toggle label="Activar modo Quiz" checked={q.enabled} onChange={(v) => set({ enabled: v })} />
      </Group>
      {q.enabled && (
        <>
          <Group title="Respuestas correctas y puntaje">
            {gradable.length === 0 && <Soon>Agrega preguntas de selección, texto o número para calificar.</Soon>}
            {gradable.map((f) => {
              const cur = f.custom_attributes_json?.quiz || { correct: [], points: 1 };
              const multi = ['checkbox', 'multiselect'].includes(f.field_type);
              return (
                <fieldset key={f.cid} className="quiz-q">
                  <legend>{f.label}</legend>
                  {HAS_OPTIONS.includes(f.field_type) ? (
                    <div className="quiz-opts">
                      {f.options_json.map((o) => (
                        <label key={o.value}>
                          <input
                            type={multi ? 'checkbox' : 'radio'}
                            name={`q-${f.cid}`}
                            checked={cur.correct.includes(o.value)}
                            onChange={(e) => setQ(f.cid, { correct: multi ? (e.target.checked ? [...cur.correct, o.value] : cur.correct.filter((x) => x !== o.value)) : [o.value] })}
                          />{' '}
                          {o.label}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <Text label="Respuesta correcta" value={cur.correct[0] || ''} onChange={(v) => setQ(f.cid, { correct: [v] })} />
                  )}
                  <Text label="Puntos" type="number" min="0" value={cur.points} onChange={(v) => setQ(f.cid, { points: Number(v) })} />
                </fieldset>
              );
            })}
          </Group>
          <Group title="Resultados">
            <Toggle label="Mostrar el puntaje al terminar" checked={q.showScore} onChange={(v) => set({ showScore: v })} />
            <Toggle label="Mostrar las respuestas correctas" checked={q.showAnswers} onChange={(v) => set({ showAnswers: v })} />
          </Group>
          <Group title="Calificaciones y retroalimentación" intro="Cada calificación aplica desde el porcentaje indicado.">
            {q.grades.map((g, i) => (
              <div key={g.id} className="grade-row">
                <Text label="Desde (%)" type="number" min="0" max="100" value={g.min} onChange={(v) => set({ grades: q.grades.map((x, j) => (j === i ? { ...x, min: Number(v) } : x)) })} />
                <Text label="Calificación" value={g.label} onChange={(v) => set({ grades: q.grades.map((x, j) => (j === i ? { ...x, label: v } : x)) })} />
                <Text label="Retroalimentación" value={g.feedback} onChange={(v) => set({ grades: q.grades.map((x, j) => (j === i ? { ...x, feedback: v } : x)) })} />
                <button type="button" className="icon-plain is-danger" aria-label={`Quitar calificación ${i + 1}`} disabled={q.grades.length <= 1} onClick={() => set({ grades: q.grades.filter((_, j) => j !== i) })}>
                  <TrashIcon width={15} height={15} />
                </button>
              </div>
            ))}
            <button type="button" className="btn btn-outline btn-sm" onClick={() => set({ grades: [...q.grades, { id: newCid(), min: 0, label: '', feedback: '' }] })}>
              <PlusIcon width={14} height={14} /> Agregar calificación
            </button>
          </Group>
        </>
      )}
    </>
  );
}

function Temporizador({ b }) {
  const t = b.settings.timer;
  const set = (p) => b.updateSettings({ timer: { ...t, ...p } });
  return (
    <Group title="Temporizador" intro="Cuenta regresiva para responder.">
      <Toggle label="Activar temporizador" checked={t.enabled} onChange={(v) => set({ enabled: v })} />
      {t.enabled && (
        <>
          <Text label="Duración (minutos)" type="number" min="1" max="600" value={t.minutes} onChange={(v) => set({ minutes: Number(v) })} />
          <Pick label="Al acabarse el tiempo" value={t.onEnd} onChange={(v) => set({ onEnd: v })} options={[['submit', 'Enviar el formulario'], ['next', 'Avanzar de página']]} />
          <Text label="Avisar cuando falten (minutos)" type="number" min="0" value={t.warnAt} onChange={(v) => set({ warnAt: Number(v) })} />
          <p className="b-hint">Accesible: avisa antes de terminar, permite ampliar el tiempo y lo anuncia a lectores de pantalla.</p>
        </>
      )}
    </Group>
  );
}

function Pdf({ b }) {
  const f = b.form;
  return (
    <>
      <Group title="PDF de la respuesta" intro="Convierte cada respuesta en un PDF: factura, certificado o comprobante.">
        <Toggle label="Generar PDF de cada envío" checked={f.submission_pdf_enabled} onChange={(v) => b.updateForm({ submission_pdf_enabled: v })} />
        {f.submission_pdf_enabled && (
          <Pick label="Plantilla" value={f.submission_pdf_template || 'simple'} onChange={(v) => b.updateForm({ submission_pdf_template: v })} options={[['simple', 'Simple'], ['branded', 'Con identidad institucional']]} />
        )}
        <p className="b-hint">Para enviarlo por correo, activa «Adjuntar PDF» en la sección Correo electrónico.</p>
      </Group>
      <Group title="PDFs de este formulario">
        <p className="b-hint">Aún no hay PDFs personalizados para este formulario.</p>
        <div className="inline">
          <Link to="/pdfs" className="btn btn-outline btn-sm">Editar</Link>
          <Link to="/pdfs" className="btn btn-primary btn-sm">Crear un PDF para este formulario</Link>
        </div>
        <Soon>El editor de PDF se construye en la fase 6.</Soon>
      </Group>
    </>
  );
}

const MAP = { general: General, correo: Correo, boton: Boton, condiciones: Condiciones, enlace: Enlace, cierre: Cierre, referencia: Referencia, quiz: Quiz, temporizador: Temporizador, pdf: Pdf };

// Pestaña Configuraciones: 10 secciones con menú a la izquierda.
export default function SettingsPanel({ b }) {
  const [section, setSection] = useState('general');
  const Current = MAP[section];
  return (
    <div className="b-settings">
      <nav className="set-nav" aria-label="Secciones de configuraciones">
        <ul>
          {SECTIONS.map(([id, label]) => (
            <li key={id}>
              <button type="button" className={`set-link${section === id ? ' is-active' : ''}`} aria-current={section === id ? 'page' : undefined} onClick={() => setSection(id)}>
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="set-body">
        <Current b={b} />
      </div>
    </div>
  );
}
