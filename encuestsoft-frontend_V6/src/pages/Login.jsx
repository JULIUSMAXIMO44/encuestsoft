import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import AuthCard from '../components/AuthCard.jsx';
import FormField from '../components/FormField.jsx';
import Alert from '../components/Alert.jsx';
import { GoogleIcon, MicrosoftIcon, AppleIcon } from '../components/Icons.jsx';

const SOCIAL = [
  { name: 'Google', Icon: GoogleIcon },
  { name: 'Microsoft', Icon: MicrosoftIcon },
  { name: 'Apple', Icon: AppleIcon },
];

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (isAuthenticated) return <Navigate to="/panel" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email.trim(), password);
      navigate(location.state?.from || '/panel', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthCard onSubmit={onSubmit}>
      <Alert>{error}</Alert>
      <FormField
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="Escriba aquí su Email de usuario"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <FormField
        label="Contraseña"
        type="password"
        autoComplete="current-password"
        placeholder="Escriba su contraseña"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
        {busy ? 'Ingresando…' : 'Ingresar'}
      </button>

      <div className="divider" role="separator">
        <span>o</span>
      </div>
      <div className="social">
        {SOCIAL.map(({ name, Icon }) => (
          <button key={name} type="button" className="btn btn-social" disabled>
            <Icon /> Continuar con {name}
          </button>
        ))}
        <p className="field-hint center">El ingreso con cuentas externas estará disponible próximamente.</p>
      </div>

      <p className="auth-links">
        ¿Aún no tiene cuenta? <Link to="/registro">Crear una</Link>
      </p>
      <p className="auth-links">
        ¿Olvidó su contraseña? <Link to="/recuperar">Recupérela aquí</Link>
      </p>
    </AuthCard>
  );
}
