import { Routes, Route } from 'react-router-dom';
import PublicLayout from './components/PublicLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import Dashboard from './pages/Dashboard.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <Routes>
      {/* Zona pública: ninguna pantalla enlaza al panel */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/ingresar" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/recuperar" element={<ForgotPassword />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Zona privada: exige sesión válida */}
      <Route element={<ProtectedRoute />}>
        <Route path="/panel" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}
