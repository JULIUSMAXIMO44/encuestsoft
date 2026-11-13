import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../services/api.js';
import AuthCard from '../components/AuthCard.jsx';
import FormField from '../components/FormField.jsx';
import Alert from '../components/Alert.jsx';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await authApi.forgotPassword(email.trim());
    } catch {
      /* mensaje neutro: no se revela si el correo existe */
    } finally {
      setBusy(false);
      setSent(true);
    }
  };

  return (
    <AuthCard title="Recuperar contraseña" onSubmit={onSubmit}>
      {sent ? (
        <Alert kind="info">Si el correo está registrado, recibirá las instrucciones para crear una nueva contraseña.</Alert>
      ) : (
        <>
          <p className="auth-text">Escriba el correo de su cuenta y le enviaremos las instrucciones.</p>
          <FormField label="Email" type="email" autoComplete="email" placeholder="Escriba aquí su Email de usuario" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Enviando…' : 'Enviar instrucciones'}
          </button>
        </>
      )}
      <p className="auth-links">
        <Link to="/ingresar">Volver a ingresar</Link>
      </p>
    </AuthCard>
  );
}
