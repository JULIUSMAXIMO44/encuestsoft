import { useState } from 'react';
import Modal from './Modal.jsx';
import Alert from './Alert.jsx';

export default function ConfirmDialog({ title, message, confirmLabel = 'Confirmar', danger = false, onConfirm, onClose }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const run = async () => {
    setBusy(true);
    setError('');
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <Modal title={title} onClose={onClose}>
      <div className="modal-body">
        <p>{message}</p>
        <Alert>{error}</Alert>
      </div>
      <div className="modal-foot">
        <button type="button" className="btn btn-outline btn-sm" onClick={onClose} disabled={busy}>
          Cancelar
        </button>
        <button type="button" className={`btn btn-sm ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={run} disabled={busy}>
          {busy ? 'Procesando…' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
