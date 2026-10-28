import React from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar.jsx';
import SimpleFooter from '../components/SimpleFooter.jsx';

/** Página 404: explica qué pasó y ofrece una salida clara. */
export default function NotFound() {
  return (
    <>
      <PublicNavbar variant="login" />
      <main className="page-main container text-center py-5" id="main-content">
        <h1>Página no encontrada</h1>
        <p className="lead">La dirección que buscas no existe o fue movida.</p>
        <Link to="/" className="btn btn-agregar-secciones">Ir al inicio</Link>
      </main>
      <SimpleFooter />
    </>
  );
}
