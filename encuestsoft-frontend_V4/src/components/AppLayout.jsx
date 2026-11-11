import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AppHeader from './AppHeader.jsx';
import Sidebar from './Sidebar.jsx';
import Footer from './Footer.jsx';

// Estructura de todas las pantallas con sesión: cabecera, menú lateral, contenido y pie amarillo.
export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();

  // En pantallas pequeñas, el menú se cierra al cambiar de ruta
  useEffect(() => setSidebarOpen(false), [pathname]);

  return (
    <div className="page app">
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <AppHeader sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen((o) => !o)} />
      <div className="app-body">
        <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
        <main id="contenido" tabIndex="-1" className="app-main">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}
