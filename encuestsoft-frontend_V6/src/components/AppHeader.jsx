import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import Popover from './Popover.jsx';
import {
  BuildingIcon,
  ChevronDownIcon,
  CheckIcon,
  GearIcon,
  ListIcon,
  PlusIcon,
  SparkleIcon,
  BellIcon,
  CardIcon,
  PuzzleIcon,
  UserIcon,
  LogoutIcon,
  MenuIcon,
} from './Icons.jsx';

function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || 'U';
}

function WorkspaceMenu({ owner }) {
  const name = owner || 'Mi usuario';
  const letter = initials(name).charAt(0);
  const label = `Workspace de ${name}`;
  return (
    <Popover
      label="Workspace"
      align="left"
      className="hdr-btn ws-btn"
      button={
        <>
          <span className="ws-avatar" aria-hidden="true">{letter}</span>
          <span className="ws-text">
            <span className="ws-label">Workspace</span>
            <span className="ws-name">{name}</span>
          </span>
          <ChevronDownIcon width={14} height={14} />
        </>
      }
    >
      {(close) => (
        <div className="menu ws-menu">
          <p className="menu-title">Cambiar workspace</p>
          <div className="ws-current" aria-current="true">
            <span className="ws-avatar" aria-hidden="true">{letter}</span>
            <span className="ws-info">
              <strong>{label}</strong>
              <span>Propietario: {name} (Tú)</span>
            </span>
            <CheckIcon width={18} height={18} />
          </div>
          <hr />
          <ul className="menu-list">
            <li>
              <Link className="menu-item" to="/workspace/configuracion" onClick={close}>
                <GearIcon width={18} height={18} /> Configuración del workspace
              </Link>
            </li>
            <li>
              <Link className="menu-item" to="/workspace/auditoria" onClick={close}>
                <ListIcon width={18} height={18} /> Registro de auditoría
              </Link>
            </li>
            <li>
              <Link className="menu-item" to="/workspace/nuevo" onClick={close}>
                <PlusIcon width={18} height={18} /> Crear workspace
              </Link>
            </li>
          </ul>
        </div>
      )}
    </Popover>
  );
}

function NewsMenu() {
  return (
    <Popover
      label="Novedades"
      className="hdr-btn"
      button={
        <>
          <SparkleIcon width={16} height={16} />
          <span className="hdr-text">Novedades</span>
        </>
      }
    >
      {(close) => (
        <div className="menu menu-wide">
          <p className="menu-title">Últimas actualizaciones</p>
          <p className="menu-empty">Aún no hay novedades publicadas.</p>
          <Link className="menu-foot" to="/novedades" onClick={close}>
            Ver todos los cambios
          </Link>
        </div>
      )}
    </Popover>
  );
}

function NotificationsMenu() {
  return (
    <Popover
      label="Notificaciones"
      className="hdr-btn hdr-icon"
      button={<BellIcon width={18} height={18} />}
    >
      {(close) => (
        <div className="menu menu-wide">
          <p className="menu-title">Notificaciones</p>
          <p className="menu-empty">No tienes notificaciones nuevas.</p>
          <Link className="menu-foot" to="/perfil#notificaciones" onClick={close}>
            Preferencias de notificaciones
          </Link>
        </div>
      )}
    </Popover>
  );
}

function UserMenu({ user, onLogout }) {
  return (
    <Popover
      label="Menú de usuario"
      className="hdr-btn hdr-user"
      button={
        <>
          <span className="avatar" aria-hidden="true">
            {initials(user?.full_name)}
          </span>
          <span className="hdr-text">{user?.full_name || 'Usuario'}</span>
          <ChevronDownIcon width={14} height={14} />
        </>
      }
    >
      {(close) => (
        <div className="menu">
          <div className="menu-user">
            <strong>{user?.full_name}</strong>
            <span>{user?.email}</span>
          </div>
          <hr />
          <ul className="menu-list">
            <li>
              <Link className="menu-item" to="/suscripcion" onClick={close}>
                <CardIcon width={16} height={16} /> Mi suscripción
              </Link>
            </li>
            <li>
              <Link className="menu-item" to="/complementos" onClick={close}>
                <PuzzleIcon width={16} height={16} /> Complementos
              </Link>
            </li>
            <li>
              <Link className="menu-item" to="/perfil" onClick={close}>
                <UserIcon width={16} height={16} /> Mi perfil
              </Link>
            </li>
          </ul>
          <hr />
          <button type="button" className="menu-item menu-button" onClick={onLogout}>
            <LogoutIcon width={16} height={16} /> Cerrar sesión
          </button>
        </div>
      )}
    </Popover>
  );
}

export default function AppHeader({ onToggleSidebar, sidebarOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <header className="topbar app-topbar">
      <div className="app-topbar-inner">
        <button
          type="button"
          className="hdr-btn hdr-icon menu-toggle"
          onClick={onToggleSidebar}
          aria-expanded={Boolean(sidebarOpen)}
          aria-controls="menu-lateral"
          aria-label="Menú lateral"
        >
          <MenuIcon width={18} height={18} />
        </button>
        <Link to="/panel" className="topbar-brand" aria-label="EncuestSoft, ir al dashboard">
          <img src="/img/logo-es.png" alt="" width="28" height="28" />
          <span className="brand-text">EncuestSoft</span>
        </Link>
        <WorkspaceMenu owner={user?.full_name} />
        <div className="app-topbar-actions">
          <Link to="/suscripcion" className="btn btn-primary btn-sm">
            Upgrade
          </Link>
          <NewsMenu />
          <NotificationsMenu />
          <UserMenu user={user} onLogout={onLogout} />
        </div>
      </div>
    </header>
  );
}
