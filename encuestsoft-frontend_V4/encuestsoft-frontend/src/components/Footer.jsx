import { Link } from 'react-router-dom';

// Pie de página: en el inicio lleva columnas de enlaces; en las demás
// pantallas públicas, solo la barra amarilla inferior.
export default function Footer({ full }) {
  return (
    <footer className="site-footer">
      {full && (
        <div className="footer-links">
          <div className="footer-grid">
            <nav aria-label="Navegación">
              <h2>Navegación</h2>
              <ul>
                <li><Link to="/">Inicio</Link></li>
                <li><a href="/#funcionalidades">Funcionalidades</a></li>
                <li><Link to="/ingresar">Iniciar sesión</Link></li>
              </ul>
            </nav>
            <nav aria-label="Cuenta">
              <h2>Cuenta</h2>
              <ul>
                <li><Link to="/ingresar">Ingresar</Link></li>
                <li><Link to="/registro">Crear cuenta</Link></li>
                <li><Link to="/recuperar">Recuperar contraseña</Link></li>
              </ul>
            </nav>
            <div>
              <h2>Institución</h2>
              <ul>
                <li>Universidad de Cartagena</li>
                <li>Fundada en 1827</li>
              </ul>
            </div>
            <div>
              <h2>Soporte</h2>
              <ul>
                <li>
                  <button type="button" className="link-btn" data-open-a11y>
                    Accesibilidad
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
      <div className="footer-bar">
        <p>© 2026 Todos los derechos reservados</p>
        <p>
          <strong>Centro de Inserción Laboral y Responsabilidad Social - U de C</strong>
        </p>
      </div>
    </footer>
  );
}
