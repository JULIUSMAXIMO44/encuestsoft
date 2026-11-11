import { Routes, Route } from 'react-router-dom';
import PublicLayout from './components/PublicLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AppLayout from './components/AppLayout.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Pending from './pages/Pending.jsx';
import PublicFormPending from './pages/PublicFormPending.jsx';
import NotFound from './pages/NotFound.jsx';

// Módulos que llegan en fases posteriores: [ruta, título, fase]
const PENDING = [
  ['/constructor/:id', 'Constructor de encuestas', 3],
  ['/constructor/:id/publicar', 'Publicar y compartir', 4],
  ['/formularios/:id/respuestas', 'Respuestas', 5],
  ['/formularios/:id/reporte', 'Reporte de respuestas', 5],
  ['/formularios/:id/analitica', 'Analítica', 5],
  ['/pdfs', 'My PDFs', 6],
  ['/perfil', 'Mi perfil', 7],
  ['/suscripcion', 'Mi suscripción', 7],
  ['/complementos', 'Complementos', 7],
  ['/workspace/configuracion', 'Configuración del workspace', 8],
  ['/workspace/auditoria', 'Registro de auditoría', 8],
  ['/workspace/nuevo', 'Crear workspace', 8],
  ['/novedades', 'Novedades', 9],
  ['/ayuda/soporte', 'Contactar con soporte', 9],
  ['/ayuda/guias', 'Guías de ayuda', 9],
  ['/ayuda/hoja-de-ruta', 'Hoja de ruta y sugerencias', 9],
];

export default function App() {
  return (
    <Routes>
      {/* Zona pública: ninguna pantalla enlaza al panel */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/ingresar" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/recuperar" element={<ForgotPassword />} />
        <Route path="/f/:uuid" element={<PublicFormPending />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Zona privada: exige sesión válida */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/panel" element={<Dashboard />} />
          {PENDING.map(([path, title, phase]) => (
            <Route key={path} path={path} element={<Pending title={title} phase={phase} />} />
          ))}
        </Route>
      </Route>
    </Routes>
  );
}
