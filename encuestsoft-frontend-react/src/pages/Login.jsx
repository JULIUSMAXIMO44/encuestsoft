import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import PublicNavbar from '../components/PublicNavbar.jsx';
import SimpleFooter from '../components/SimpleFooter.jsx';
import RegistroModal from '../components/RegistroModal.jsx';
import RecuperarModal from '../components/RecuperarModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useUi } from '../context/UiContext.jsx';

/**
 * Login
 * ------------------------------------------------------------------
 * Inicio de sesión contra POST /auth/login. Conserva el diseño aprobado y añade:
 * validación en línea con mensajes, estado de carga, error anunciado (role="alert")
 * y redirección a la página que el usuario intentaba abrir.
 */
export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const { notify } = useUi();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [wasValidated, setWasValidated] = useState(false);
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = password.length > 0;

  if (isAuthenticated) return <Navigate to={location.state?.from || '/dashboard'} replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setApiError('');
    if (!isEmailValid || !isPasswordValid) {
      setWasValidated(true);
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PublicNavbar variant="login" />

      <main className="page-main login-wrapper" id="main-content">
        <div className="login-card">
          <h1>Encuestsoft</h1>
          <div className="login-badges">
            <span className="badge-circle">
              <img src="/images/udec-badge.svg" alt="Insignia Universidad de Cartagena" width="56" height="56" />
            </span>
            <span className="badge-circle">
              <img src="/images/es-badge-gold.svg" alt="Insignia EncuestSoft" width="56" height="56" />
            </span>
          </div>

          <form id="loginForm" className={`needs-validation${wasValidated ? ' was-validated' : ''}`} noValidate onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                id="email"
                placeholder="Escriba aquí su Email de usuario"
                autoComplete="username"
                aria-describedby="email-error"
                aria-invalid={wasValidated && !isEmailValid ? true : undefined}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <div className="invalid-msg" id="email-error">Ingresa un correo válido, por ejemplo nombre@dominio.com.</div>
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">Contraseña</label>
              <div className="pass-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  id="password"
                  placeholder="Escriba su contraseña"
                  autoComplete="current-password"
                  aria-describedby="password-error"
                  aria-invalid={wasValidated && !isPasswordValid ? true : undefined}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <button
                  type="button"
                  className="pass-toggle"
                  id="togglePassword"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} aria-hidden="true"></i>
                </button>
              </div>
              <div className="invalid-msg" id="password-error">Escribe tu contraseña.</div>
            </div>

            <button type="submit" className="btn btn-brand-green" disabled={loading}>
              {loading && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>}
              {loading ? 'Ingresando…' : 'Ingresar'}
            </button>

            {apiError && <div className="alert alert-danger mt-3 py-2 small" role="alert">{apiError}</div>}
          </form>

          <div className="divider-or">o</div>

          {/* El backend aún no ofrece inicio de sesión social: se muestran deshabilitados para no inducir a error. */}
          {[['bi-google', 'Google', '#EA4335'], ['bi-microsoft', 'Microsoft Account', '#00A4EF'], ['bi-apple', 'Apple', undefined]].map(([icon, name, color]) => (
            <button key={name} type="button" className="btn-social" disabled aria-disabled="true" title="Próximamente" style={{ opacity: 0.55, cursor: 'not-allowed' }}>
              <i className={`bi ${icon}`} style={color ? { color } : undefined} aria-hidden="true"></i> Continue with {name} <span className="visually-hidden">(próximamente)</span>
            </button>
          ))}

          <p className="login-links mt-3 mb-1">
            ¿Aún no tiene cuenta?{' '}
            <button type="button" className="btn btn-link p-0 align-baseline" data-bs-toggle="modal" data-bs-target="#registroModal">Crear una</button>
          </p>
          <p className="login-links">
            ¿Olvidó su contraseña?{' '}
            <button type="button" className="btn btn-link p-0 align-baseline" data-bs-toggle="modal" data-bs-target="#recuperarModal">Recupérela aquí</button>
          </p>
        </div>
      </main>

      <SimpleFooter />

      <RegistroModal />
      <RecuperarModal onSend={() => notify('Si el correo existe en nuestro sistema, recibirás un enlace de recuperación.')} />
    </>
  );
}
