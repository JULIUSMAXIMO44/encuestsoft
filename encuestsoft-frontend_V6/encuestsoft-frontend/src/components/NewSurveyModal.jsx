import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal.jsx';
import Alert from './Alert.jsx';
import { WandIcon, PlusIcon, LayoutIcon, FileIcon } from './Icons.jsx';

const OPTIONS = [
  { id: 'ia', Icon: WandIcon, title: 'Crear con IA', text: 'Describe el formulario que necesitas y la IA lo construye por ti.' },
  { id: 'cero', Icon: PlusIcon, title: 'Empezar desde cero', text: 'Un lienzo en blanco para armar tu encuesta paso a paso.' },
  { id: 'plantilla', Icon: LayoutIcon, title: 'Usar una plantilla', text: 'Elige entre muchas plantillas listas para usar.' },
  { id: 'google', Icon: FileIcon, title: 'Importar desde Google Forms', text: 'Pega el enlace de tu formulario y copiamos las preguntas.' },
];

function Soon({ children }) {
  return (
    <p className="soon" role="note">
      {children}
    </p>
  );
}

export default function NewSurveyModal({ onClose, onCreate }) {
  const navigate = useNavigate();
  const [step, setStep] = useState('opciones');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const back = () => {
    setError('');
    setStep('opciones');
  };

  const submitScratch = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Escriba un nombre para la encuesta.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const form = await onCreate({ title: title.trim(), description: description.trim() });
      onClose();
      navigate(`/constructor/${form.id}`);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  const Back = (
    <button type="button" className="btn btn-outline btn-sm" onClick={back}>
      Volver
    </button>
  );

  return (
    <Modal title="Nueva encuesta" onClose={onClose} wide={step === 'opciones'}>
      {step === 'opciones' && (
        <div className="modal-body">
          <p className="modal-lead">¿Cómo quieres empezar?</p>
          <ul className="option-grid">
            {OPTIONS.map(({ id, Icon, title: t, text }) => (
              <li key={id}>
                <button type="button" className="option-card" onClick={() => setStep(id)}>
                  <Icon width={22} height={22} className="option-icon" />
                  <strong>{t}</strong>
                  <span>{text}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {step === 'cero' && (
        <form onSubmit={submitScratch} noValidate>
          <div className="modal-body">
            <Alert>{error}</Alert>
            <div className="field">
              <label htmlFor="ns-title">Nombre de la encuesta</label>
              <div className="input-wrap">
                <input id="ns-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} placeholder="Ej.: Encuesta de satisfacción 2026" required />
              </div>
            </div>
            <div className="field">
              <label htmlFor="ns-desc">Descripción (opcional)</label>
              <div className="input-wrap">
                <textarea id="ns-desc" rows="3" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="¿Para qué sirve esta encuesta?" />
              </div>
            </div>
          </div>
          <div className="modal-foot">
            {Back}
            <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>
              {busy ? 'Creando…' : 'Crear encuesta'}
            </button>
          </div>
        </form>
      )}

      {step === 'ia' && (
        <>
          <div className="modal-body">
            <div className="field">
              <label htmlFor="ns-ia">Describe tu formulario</label>
              <div className="input-wrap">
                <textarea id="ns-ia" rows="4" placeholder="Ej.: Encuesta de satisfacción para estudiantes sobre el servicio de biblioteca" disabled />
              </div>
            </div>
            <Soon>La creación con IA estará disponible próximamente.</Soon>
          </div>
          <div className="modal-foot">
            {Back}
            <button type="button" className="btn btn-primary btn-sm" disabled>
              Generar formulario
            </button>
          </div>
        </>
      )}

      {step === 'plantilla' && (
        <>
          <div className="modal-body">
            <Soon>Las plantillas estarán disponibles próximamente.</Soon>
          </div>
          <div className="modal-foot">{Back}</div>
        </>
      )}

      {step === 'google' && (
        <>
          <div className="modal-body">
            <div className="field">
              <label htmlFor="ns-google">Enlace del formulario de Google</label>
              <div className="input-wrap">
                <input id="ns-google" type="url" placeholder="https://docs.google.com/forms/…" disabled />
              </div>
            </div>
            <Soon>La importación desde Google Forms estará disponible próximamente.</Soon>
          </div>
          <div className="modal-foot">
            {Back}
            <button type="button" className="btn btn-primary btn-sm" disabled>
              Importar preguntas
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
