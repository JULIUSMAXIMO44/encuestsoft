import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Perfil from './pages/Perfil.jsx';
import Configuracion from './pages/Configuracion.jsx';
import FormBuilder from './pages/FormBuilder.jsx';
import Responses from './pages/Responses.jsx';
import PublicForm from './pages/PublicForm.jsx';
import NotFound from './pages/NotFound.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AccessibilityWidget from './components/AccessibilityWidget.jsx';

/**
 * Al cambiar de ruta se restablece el scroll, se actualiza el título del documento y el
 * foco pasa al contenido principal (navegación accesible en aplicaciones de una sola página).
 */
function RouteAnnouncer() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
    const main = document.getElementById('main-content');
    if (main) {
      main.setAttribute('tabindex', '-1');
      main.focus({ preventScroll: true });
    }
  }, [pathname]);
  return null;
}

/**
 * App — árbol de rutas de EncuestSoft.
 *  Públicas : /, /login, /f/:uuid (responder un formulario)
 *  Privadas : /dashboard, /formularios/:id/editar, /formularios/:id/respuestas, /perfil, /configuracion
 */
function App() {
  const protect = (el) => <ProtectedRoute>{el}</ProtectedRoute>;
  return (
    <>
      <a className="skip-link" href="#main-content">Saltar al contenido principal</a>
      <RouteAnnouncer />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/f/:uuid" element={<PublicForm />} />
        <Route path="/dashboard" element={protect(<Dashboard />)} />
        <Route path="/formularios/:id/editar" element={protect(<FormBuilder />)} />
        <Route path="/formularios/:id/respuestas" element={protect(<Responses />)} />
        <Route path="/perfil" element={protect(<Perfil />)} />
        <Route path="/configuracion" element={protect(<Configuracion />)} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <AccessibilityWidget />
    </>
  );
}

export default App;
