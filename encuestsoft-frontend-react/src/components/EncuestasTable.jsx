import React from 'react';
import { Link } from 'react-router-dom';
import { STATUS_LABELS, formatDate } from '../utils/format.js';

const STATUS_CLASS = { draft: 'text-bg-secondary', published: 'text-bg-success', paused: 'text-bg-warning', archived: 'text-bg-dark' };

/**
 * EncuestasTable
 * ------------------------------------------------------------------
 * Tabla de encuestas del panel. Componente de presentación: recibe la lista ya filtrada
 * y notifica al padre las acciones del usuario. El estado se indica con texto (no solo color).
 *
 * @param {{ encuestas: Array<object>, onShare: Function, onDuplicate: Function, onDelete: Function }} props
 */
export default function EncuestasTable({ encuestas, onShare, onDuplicate, onDelete }) {
  return (
    <div className="table-responsive">
      <table className="table align-middle" id="encuestasTable">
        <caption className="visually-hidden">Listado de encuestas creadas</caption>
        <thead>
          <tr>
            <th scope="col">Id</th>
            <th scope="col">Título Encuesta</th>
            <th scope="col">Descripción</th>
            <th scope="col">Estado</th>
            <th scope="col">Creado el</th>
            <th scope="col">Envíos</th>
            <th scope="col">Acciones</th>
          </tr>
        </thead>
        <tbody id="encuestasBody">
          {encuestas.map((f) => (
            <tr key={f.id}>
              <td>{f.id}</td>
              <td className="fw-semibold"><Link to={`/formularios/${f.id}/editar`}>{f.title}</Link></td>
              <td className="table-desc">{f.description}</td>
              <td><span className={`badge ${STATUS_CLASS[f.status] || 'text-bg-secondary'}`}>{STATUS_LABELS[f.status] || f.status}</span></td>
              <td>{formatDate(f.created_at)}</td>
              <td>{f.submissions_count ?? 0}</td>
              <td>
                <div className="action-icons">
                  <Link to={`/formularios/${f.id}/respuestas`} className="action-btn action-view" title="Ver respuestas" aria-label={`Ver respuestas de ${f.title}`}>
                    <i className="bi bi-eye" aria-hidden="true"></i>
                  </Link>
                  <Link to={`/formularios/${f.id}/editar`} className="action-btn action-edit" title="Editar" aria-label={`Editar ${f.title}`}>
                    <i className="bi bi-pencil" aria-hidden="true"></i>
                  </Link>
                  <button type="button" className="action-btn action-share" title="Compartir" aria-label={`Compartir ${f.title}`} onClick={() => onShare(f)}>
                    <i className="bi bi-share" aria-hidden="true"></i>
                  </button>
                  <Link to={`/formularios/${f.id}/editar?tab=config`} className="action-btn action-settings" title="Configurar" aria-label={`Configurar ${f.title}`}>
                    <i className="bi bi-gear" aria-hidden="true"></i>
                  </Link>
                  <button type="button" className="action-btn action-settings" title="Duplicar" aria-label={`Duplicar ${f.title}`} onClick={() => onDuplicate(f)}>
                    <i className="bi bi-copy" aria-hidden="true"></i>
                  </button>
                  <button type="button" className="action-btn action-delete" title="Eliminar" aria-label={`Eliminar ${f.title}`} onClick={() => onDelete(f)}>
                    <i className="bi bi-trash" aria-hidden="true"></i>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
