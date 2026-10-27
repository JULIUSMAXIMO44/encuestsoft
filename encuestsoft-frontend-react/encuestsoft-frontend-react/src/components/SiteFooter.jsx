import React from 'react';
import { Link } from 'react-router-dom';

/**
 * SiteFooter
 * ------------------------------------------------------------------
 * Pie de página con un menú de hasta 4 columnas de enlaces reales, más
 * la barra inferior de derechos reservados. Se usa en Inicio y en el
 * Panel principal, cada uno con su propio conjunto de columnas.
 *
 * Cada enlace de `columns` admite una de estas tres formas, según su
 * destino:
 *  - { label, to }:  navega a una ruta interna (React Router).
 *  - { label, href }: enlace normal (ancla dentro de la página, p. ej. "#funcionalidades").
 *  - { label, tab }:  activa una pestaña de Bootstrap ya presente en la página
 *                     (usado en el panel para enlazar a Formularios/Plantillas/Compartidos).
 *
 * @param {{ columns: Array<{ title: string, links: Array<object> }> }} props
 */
export default function SiteFooter({ columns }) {
  const year = new Date().getFullYear();

  return (
    <div className="site-footer-wrap mt-5">
      <section className="footer-menu">
        <div className="container">
          <div className="row">
            {columns.map((column) => (
              <div className="col-6 col-md-3" key={column.title}>
                <h4>{column.title}</h4>
                <ul>
                  {column.links.map((link) => (
                    <li key={link.label}>
                      {link.to && <Link to={link.to}>{link.label}</Link>}
                      {link.href && <a href={link.href}>{link.label}</a>}
                      {link.tab && (
                        <a href={`#${link.tab}`} data-bs-toggle="tab" data-bs-target={`#${link.tab}`}>
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

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
