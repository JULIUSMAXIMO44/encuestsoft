import React from 'react';

/**
 * SimpleFooter
 * ------------------------------------------------------------------
 * Barra inferior con los derechos reservados y el nombre del centro.
 * Se usa en las páginas que no llevan el menú de cuatro columnas
 * (Login, Mi perfil, Configuración).
 */
export default function SimpleFooter() {
  const year = new Date().getFullYear();
  return (
    <div className="site-footer-wrap">
      <footer className="footer-bar">
        <div className="container">
          <div>© {year} Todos los derechos reservados</div>
          <div>
            <strong>Centro de Inserción Laboral y Responsabilidad Social - U de C</strong>
          </div>
        </div>
      </footer>
    </div>
  );
}
