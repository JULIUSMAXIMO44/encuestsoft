import { Link, useLocation } from 'react-router-dom';

// Pantalla provisional para módulos que se construyen en fases posteriores.
// Evita enlaces rotos mientras avanza el plan.
export default function Pending({ title, phase }) {
  const { pathname } = useLocation();
  return (
    <div className="dash">
      <div className="dash-head">
        <h1>{title}</h1>
      </div>
      <section className="panel pending" aria-label={title}>
        <p>
          Este módulo se construye en la fase {phase} del plan.
        </p>
        <p className="field-hint">Ruta: {pathname}</p>
        <Link to="/panel" className="btn btn-outline btn-sm">
          Volver al dashboard
        </Link>
      </section>
    </div>
  );
}
