import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Página no encontrada</h1>
        <p className="auth-text">La dirección que busca no existe.</p>
        <Link to="/" className="btn btn-primary btn-block">
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
