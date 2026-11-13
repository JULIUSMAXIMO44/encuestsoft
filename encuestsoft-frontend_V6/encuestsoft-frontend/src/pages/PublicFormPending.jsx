import { Link } from 'react-router-dom';

// Marcador de la vista pública del formulario (se construye en la fase 4).
export default function PublicFormPending() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Vista de la encuesta</h1>
        <p className="auth-text">La vista pública de las encuestas se construye en la fase 4 del plan.</p>
        <Link to="/" className="btn btn-outline btn-block">
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
