import React, { useEffect, useRef, useState } from 'react';
import { Modal } from 'bootstrap';
import { formsApi } from '../services/api.js';
import { useUi } from '../context/UiContext.jsx';
import { STATUS_LABELS } from '../utils/format.js';

/**
 * ShareModal
 * ------------------------------------------------------------------
 * Gestiona la publicación y difusión de un formulario: estado (borrador/publicado/pausado),
 * enlace directo, código para incrustar (iframe) y protección con contraseña.
 *
 * @param {{ form: object|null, onClose: () => void, onUpdated: (form: object) => void }} props
 */
export default function ShareModal({ form, onClose, onUpdated }) {
  const modalRef = useRef(null);
  const { notify } = useUi();
  const [embed, setEmbed] = useState(null);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Abre/cierra el modal según la prop `form`.
  useEffect(() => {
    const el = modalRef.current;
    if (!form || !el) return undefined;
    setError('');
    setPassword('');
    const instance = Modal.getOrCreateInstance(el);
    el.addEventListener('hidden.bs.modal', onClose, { once: true });
    instance.show();
    formsApi.embed(form.id).then(setEmbed).catch(() => {
      // Si falla el endpoint, se construye el enlace con el origen actual.
      const link = `${window.location.origin}/f/${form.uuid}`;
      setEmbed({ direct_link: link, iframe: `<iframe src="${link}" style="width:100%;border:0;min-height:600px;" title="${form.title}" loading="lazy"></iframe>` });
    });
    return () => el.removeEventListener('hidden.bs.modal', onClose);
  }, [form?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function run(action, okMessage) {
    setBusy(true);
    setError('');
    try {
      const updated = await action();
      if (updated) onUpdated({ ...form, ...updated });
      notify(okMessage);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const copy = async (text, what) => {
    try {
      await navigator.clipboard.writeText(text);
      notify(`${what} copiado al portapapeles.`);
    } catch {
      notify('No se pudo copiar automáticamente. Selecciónelo y cópielo manualmente.');
    }
  };

  const isPublished = form?.status === 'published';

  return (
    <div className="modal fade" tabIndex="-1" aria-hidden="true" aria-labelledby="shareTitle" ref={modalRef}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title h5" id="shareTitle">Compartir: {form?.title}</h2>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger py-2" role="alert">{error}</div>}

            <section aria-labelledby="share-status" className="mb-4">
              <h3 className="h6" id="share-status">Estado de publicación</h3>
              <p>Estado actual: <strong>{STATUS_LABELS[form?.status] || form?.status}</strong>. Solo los formularios <em>publicados</em> reciben respuestas.</p>
              <div className="d-flex gap-2 flex-wrap">
                {!isPublished && <button type="button" className="btn btn-agregar-secciones" disabled={busy} onClick={() => run(() => formsApi.setStatus(form.id, 'published'), 'Formulario publicado.')}>Publicar</button>}
                {isPublished && <button type="button" className="btn btn-outline-salir" disabled={busy} onClick={() => run(() => formsApi.setStatus(form.id, 'paused'), 'Formulario pausado.')}>Pausar</button>}
                {form?.status !== 'draft' && <button type="button" className="btn btn-outline-salir" disabled={busy} onClick={() => run(() => formsApi.setStatus(form.id, 'draft'), 'Formulario devuelto a borrador.')}>Volver a borrador</button>}
              </div>
            </section>

            <section aria-labelledby="share-link" className="mb-4">
              <h3 className="h6" id="share-link">Enlace directo</h3>
              <div className="input-group">
                <input type="text" readOnly className="form-control" aria-label="Enlace directo al formulario" value={embed?.direct_link || ''} onFocus={(e) => e.target.select()} />
                <button type="button" className="btn btn-outline-salir" onClick={() => copy(embed?.direct_link, 'Enlace')}>Copiar enlace</button>
              </div>
              {!isPublished && <p className="form-text">El enlace funcionará cuando el formulario esté publicado.</p>}
            </section>

            <section aria-labelledby="share-embed" className="mb-4">
              <h3 className="h6" id="share-embed">Código para incrustar en un sitio web</h3>
              <textarea readOnly rows={3} className="form-control font-monospace small" aria-label="Código iframe" value={embed?.iframe || ''} onFocus={(e) => e.target.select()}></textarea>
              <button type="button" className="btn btn-outline-salir mt-2" onClick={() => copy(embed?.iframe, 'Código')}>Copiar código</button>
            </section>

            <section aria-labelledby="share-pass">
              <h3 className="h6" id="share-pass">Protección con contraseña</h3>
              <p className="form-text">{form?.is_password_protected ? 'Este formulario pide contraseña.' : 'Cualquiera con el enlace puede responder.'}</p>
              <div className="input-group">
                <label htmlFor="share-password" className="visually-hidden">Nueva contraseña del formulario</label>
                <input id="share-password" type="password" className="form-control" placeholder="Nueva contraseña" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" className="btn btn-agregar-secciones" disabled={busy || !password} onClick={() => run(async () => { const f = await formsApi.setPassword(form.id, password); setPassword(''); return f; }, 'Contraseña establecida.')}>Guardar</button>
                {form?.is_password_protected && <button type="button" className="btn btn-outline-salir" disabled={busy} onClick={() => run(() => formsApi.setPassword(form.id, ''), 'Se quitó la contraseña.')}>Quitar</button>}
              </div>
            </section>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline-salir" data-bs-dismiss="modal">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
