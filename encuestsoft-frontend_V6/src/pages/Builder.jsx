import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useFormBuilder } from '../hooks/useFormBuilder.js';
import Tabs from '../components/Tabs.jsx';
import Alert from '../components/Alert.jsx';
import Palette from '../components/builder/Palette.jsx';
import Canvas from '../components/builder/Canvas.jsx';
import FieldProperties from '../components/builder/FieldProperties.jsx';
import DesignPanel from '../components/builder/DesignPanel.jsx';
import SettingsPanel from '../components/builder/SettingsPanel.jsx';
import { ChevronLeftIcon, EyeIcon } from '../components/Icons.jsx';

const STATUS = { draft: 'Borrador', published: 'Publicado', paused: 'Pausado', archived: 'Archivado' };
const TABS = [
  { id: 'constructor', label: 'Constructor' },
  { id: 'diseno', label: 'Diseño' },
  { id: 'config', label: 'Configuraciones' },
  { id: 'integrar', label: 'Integrar' },
  { id: 'publicar', label: 'Publicar' },
];

const hhmm = (d) => d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

// Constructor de encuestas: elementos, lienzo y propiedades, más Diseño y Configuraciones.
export default function Builder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const b = useFormBuilder(id);
  const [tab, setTab] = useState('constructor');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  // Ctrl+S / Cmd+S guarda
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (b.form && !b.saving) b.save();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (b.loading) return <p className="state" role="status">Cargando el constructor…</p>;
  if (b.error) {
    return (
      <div className="state">
        <Alert>{b.error}</Alert>
        <button type="button" className="btn btn-outline btn-sm" onClick={b.reload}>Reintentar</button>
        <Link to="/panel" className="btn btn-outline btn-sm">Volver al dashboard</Link>
      </div>
    );
  }

  const leave = (e) => {
    if (b.dirty && !window.confirm('Tienes cambios sin guardar. ¿Salir sin guardar?')) e.preventDefault();
  };

  const publish = async () => {
    setErr('');
    setMsg('');
    if (b.dirty && !(await b.save())) return;
    try {
      await b.setStatus(b.form.status === 'published' ? 'draft' : 'published');
      setMsg(b.form.status === 'published' ? 'El formulario volvió a borrador.' : 'Formulario publicado.');
    } catch (e) {
      setErr(e.message);
    }
  };

  const isPub = b.form.status === 'published';

  return (
    <div className="builder">
      <header className="b-bar">
        <Link to="/panel" className="b-back" onClick={leave} aria-label="Volver al dashboard">
          <ChevronLeftIcon width={16} height={16} /> Dashboard
        </Link>
        <div className="b-name">
          <h1>{b.form.title}</h1>
          <span className={`badge badge-${b.form.status}`}>{STATUS[b.form.status] || b.form.status}</span>
        </div>
        <div className="b-actions">
          <span className="b-saved" role="status" aria-live="polite">
            {b.saving ? 'Guardando…' : b.dirty ? 'Cambios sin guardar' : b.savedAt ? `Guardado a las ${hhmm(b.savedAt)}` : ''}
          </span>
          <button type="button" className="btn btn-outline btn-sm" onClick={b.undo} disabled={!b.canUndo} title="Deshacer el último cambio en los campos">
            Deshacer
          </button>
          <a className="btn btn-outline btn-sm" href={`/f/${b.form.uuid}`} target="_blank" rel="noopener noreferrer" aria-label="Vista previa (se abre en una pestaña nueva)">
            <EyeIcon width={14} height={14} /> Vista previa
          </a>
          <button type="button" className="btn btn-outline btn-sm" onClick={b.save} disabled={b.saving || !b.dirty}>
            Guardar
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={publish} disabled={b.saving}>
            {isPub ? 'Pasar a borrador' : 'Publicar'}
          </button>
        </div>
      </header>

      <div className="b-alerts">
        <Alert kind="info">{msg}</Alert>
        <Alert>{err || b.saveError}</Alert>
        {b.warnings.map((w) => (
          <Alert key={w}>{w}</Alert>
        ))}
      </div>

      <Tabs tabs={TABS} value={tab} onChange={setTab}>
        {tab === 'constructor' && (
          <div className="b-grid">
            <Palette onAdd={(item) => b.addField(item, b.selected ? b.fields.findIndex((f) => f.cid === b.selected) + 1 : undefined)} />
            <Canvas b={b} />
            <FieldProperties b={b} />
          </div>
        )}
        {tab === 'diseno' && (
          <div className="b-grid b-grid-2">
            <Canvas b={b} />
            <DesignPanel b={b} />
          </div>
        )}
        {tab === 'config' && <SettingsPanel b={b} />}
        {tab === 'integrar' && (
          <section className="panel pending">
            <p>Las integraciones (WebHook, Stripe, PayPal, Hoja de Google, Discord, Slack, Mailchimp…) se construyen en la fase 4.</p>
          </section>
        )}
        {tab === 'publicar' && (
          <section className="panel pending">
            <p>Compartir por enlace, redes sociales, código QR, página web y popup se construye en la fase 4.</p>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => navigate(`/constructor/${id}/publicar`)}>
              Abrir la pantalla de publicación
            </button>
          </section>
        )}
      </Tabs>
    </div>
  );
}
