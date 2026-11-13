import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import AuthCard from '../components/AuthCard.jsx';
import FormField from '../components/FormField.jsx';
import Alert from '../components/Alert.jsx';

const EMPTY = { full_name: '', organization_name: '', email: '', password: '' };

export default function Register() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (isAuthenticated) return <Navigate to="/panel" replace />;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.full_name.trim()) errs.full_name = 'Escriba su nombre completo.';
    if (!form.organization_name.trim()) errs.organization_name = 'Escriba el nombre de su organización.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Escriba un correo válido.';
    if (form.password.length < 8) errs.password = 'La contraseña debe tener al menos 8 caracteres.';
    return errs;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      await register({ ...form, email: form.email.trim() });
      navigate('/panel', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthCard title="Crear cuenta" onSubmit={onSubmit}>
      <Alert>{error}</Alert>
      <FormField label="Nombre completo" autoComplete="name" placeholder="Escriba su nombre completo" required value={form.full_name} onChange={set('full_name')} error={fieldErrors.full_name} />
      <FormField label="Organización" autoComplete="organization" placeholder="Escriba el nombre de su organización" required value={form.organization_name} onChange={set('organization_name')} error={fieldErrors.organization_name} />
      <FormField label="Email" type="email" autoComplete="email" placeholder="Escriba aquí su Email de usuario" required value={form.email} onChange={set('email')} error={fieldErrors.email} />
      <FormField
        label="Contraseña"
        type="password"
        autoComplete="new-password"
        placeholder="Mínimo 8 caracteres"
        required
        value={form.password}
        onChange={set('password')}
        error={fieldErrors.password}
      />
      <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
        {busy ? 'Creando cuenta…' : 'Crear cuenta'}
      </button>
      <p className="auth-links">
        ¿Ya tiene cuenta? <Link to="/ingresar">Ingresar</Link>
      </p>
    </AuthCard>
  );
}
