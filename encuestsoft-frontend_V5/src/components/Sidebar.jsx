import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ListIcon, FilePdfIcon, HelpIcon, ChevronDownIcon, MessageIcon, FileIcon, MapIcon } from './Icons.jsx';

const link = ({ isActive }) => `side-link${isActive ? ' is-active' : ''}`;

export default function Sidebar({ open, onNavigate }) {
  const [helpOpen, setHelpOpen] = useState(false);
  return (
    <nav id="menu-lateral" className={`sidebar${open ? ' is-open' : ''}`} aria-label="Menú lateral">
      <ul>
        <li>
          <NavLink to="/panel" className={link} onClick={onNavigate}>
            <ListIcon width={17} height={17} /> Formularios
          </NavLink>
        </li>
        <li>
          <NavLink to="/pdfs" className={link} onClick={onNavigate}>
            <FilePdfIcon width={17} height={17} /> My PDFs <span className="badge badge-beta">BETA</span>
          </NavLink>
        </li>
        <li>
          <button
            type="button"
            className="side-link side-toggle"
            aria-expanded={helpOpen}
            aria-controls="submenu-ayuda"
            onClick={() => setHelpOpen((o) => !o)}
          >
            <HelpIcon width={17} height={17} /> Help &amp; Support
            <ChevronDownIcon width={14} height={14} className={`chev${helpOpen ? ' is-open' : ''}`} />
          </button>
          {helpOpen && (
            <ul id="submenu-ayuda" className="submenu">
              <li>
                <NavLink to="/ayuda/soporte" className={link} onClick={onNavigate}>
                  <MessageIcon width={16} height={16} /> Contactar con soporte
                </NavLink>
              </li>
              <li>
                <NavLink to="/ayuda/guias" className={link} onClick={onNavigate}>
                  <FileIcon width={16} height={16} /> Guías de ayuda
                </NavLink>
              </li>
              <li>
                <NavLink to="/ayuda/hoja-de-ruta" className={link} onClick={onNavigate}>
                  <MapIcon width={16} height={16} /> Hoja de ruta y sugerencias
                </NavLink>
              </li>
            </ul>
          )}
        </li>
      </ul>
    </nav>
  );
}
