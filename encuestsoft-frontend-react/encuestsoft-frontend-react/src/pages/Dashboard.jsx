import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import DashboardNav from '../components/DashboardNav.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import EncuestasTable from '../components/EncuestasTable.jsx';
import NuevaEncuestaModal from '../components/NuevaEncuestaModal.jsx';
import ShareModal from '../components/ShareModal.jsx';
import { formsApi } from '../services/api.js';
import { useUi } from '../context/UiContext.jsx';

/** Columnas del pie de página del panel principal. */
const FOOTER_COLUMNS = [
  {
    title: 'Navegación',
    links: [
      { label: 'Inicio', to: '/' },
      { label: 'Panel principal', to: '/dashboard' },
    ],
  },
  {
    title: 'Cuenta',
    links: [
      { label: 'Mi perfil', to: '/perfil' },
      { label: 'Configuración', to: '/configuracion' },
    ],
  },
  {
    title: 'Panel',
    links: [
      { label: 'Formularios', tab: 'tabFormularios' },
      { label: 'Plantillas', tab: 'tabPlantillas' },
      { label: 'Compartidos', tab: 'tabCompartidos' },
    ],
  },
  {
    title: 'Soporte',
    links: [{ label: 'Accesibilidad', to: '/configuracion' }],
  },
];

/**
 * Dashboard
 * ------------------------------------------------------------------
 * Panel principal: resumen de acciones, pestañas de Formularios /
 * Plantillas / Compartidos, tabla de encuestas con búsqueda y el
 * formulario modal para crear encuestas nuevas.
 *
 * Todo el estado de las encuestas (lista, búsqueda, creación,
 * eliminación) vive aquí y se reparte a los componentes hijos por
 * props, siguiendo el flujo de datos unidireccional de React.
 */
export default function Dashboard() {
  const navigate = useNavigate();
  const { notify, confirm } = useUi();
  const [encuestas, setEncuestas] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [loadError, setLoadError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);
  const [sharing, setSharing] = useState(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      setEncuestas(await formsApi.list());
      setStatus('ready');
    } catch (err) {
      setLoadError(err.message);
      setStatus('error');
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [searchTerm, pageSize]);

  const encuestasFiltradas = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return encuestas;
    return encuestas.filter((e) => e.title.toLowerCase().includes(term) || (e.description || '').toLowerCase().includes(term));
  }, [encuestas, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(encuestasFiltradas.length / pageSize));
  const visibles = encuestasFiltradas.slice((page - 1) * pageSize, page * pageSize);

  /** Crea el formulario en modo borrador, guarda las fechas y abre el constructor. */
  async function handleCreateEncuesta({ titulo, descripcion, fechaInicio, fechaCierre }) {
    const created = await formsApi.create({ title: titulo, description: descripcion });
    await formsApi.update(created.id, {
      opens_at: new Date(`${fechaInicio}T00:00:00`).toISOString(),
      closes_at: new Date(`${fechaCierre}T23:59:59`).toISOString(),
    });
    notify(`La encuesta "${titulo}" fue creada correctamente.`);
    navigate(`/formularios/${created.id}/editar`);
  }

  async function handleDuplicate(form) {
    try {
      const copy = await formsApi.duplicate(form.id);
      setEncuestas((prev) => [copy, ...prev]);
      notify(`Se creó "${copy.title}".`);
    } catch (err) {
      notify(err.message);
    }
  }

  async function handleDelete(form) {
    const ok = await confirm({
      title: 'Eliminar encuesta',
      message: `¿Deseas eliminar "${form.title}"? Dejará de estar disponible y no recibirá más respuestas.`,
      confirmLabel: 'Eliminar',
      danger: true,
    });
    if (!ok) return;
    try {
      await formsApi.remove(form.id);
      setEncuestas((prev) => prev.filter((e) => e.id !== form.id));
      notify('La encuesta fue eliminada.');
    } catch (err) {
      notify(err.message);
    }
  }

  const handleUpdated = (updated) => {
    setEncuestas((prev) => prev.map((e) => (e.id === updated.id ? { ...e, ...updated } : e)));
    setSharing((cur) => (cur ? { ...cur, ...updated } : cur));
  };

  return (
    <>
      <DashboardNav searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <main className="container page-main" id="main-content">
        <section className="dash-intro">
          <h1>Crear encuestas</h1>
          <p>
            Para <strong>CREAR</strong> una nueva encuesta, presione el botón verde <strong>Nueva Encuesta</strong>.
            Para <strong>ACCEDER</strong> a una encuesta existente, dé clic sobre el nombre de la encuesta que vaya a
            revisar.
          </p>
        </section>

        <p className="fw-semibold mb-2" style={{ fontSize: '.9rem' }}>
          Resumen acciones ENCUESTSOFT UDC
        </p>
        <div className="row summary-row g-3 align-items-stretch">
          <div className="col-md-3 col-6">
            <div className="summary-card">
              <div className="summary-icon formularios">
                <i className="bi bi-journal-text" aria-hidden="true"></i>
              </div>
              <div>
                <div className="summary-count">{encuestas.length}</div>
                <div className="summary-label">Formularios</div>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="summary-card">
              <div className="summary-icon plantillas">
                <i className="bi bi-file-earmark-richtext" aria-hidden="true"></i>
              </div>
              <div>
                <div className="summary-count">0</div>
                <div className="summary-label">Plantillas</div>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="summary-card">
              <div className="summary-icon envios">
                <i className="bi bi-hand-index-thumb" aria-hidden="true"></i>
              </div>
              <div>
                <div className="summary-count">{encuestas.reduce((total, e) => total + (e.submissions_count || 0), 0)}</div>
                <div className="summary-label">Envíos</div>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-6 d-flex">
            <button
              className="btn btn-nueva-encuesta w-100 align-self-center"
              data-bs-toggle="modal"
              data-bs-target="#nuevaEncuestaModal"
            >
              <i className="bi bi-plus-lg" aria-hidden="true"></i> Nueva Encuesta
            </button>
          </div>
        </div>

        <ul className="nav nav-tabs mt-4" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className="nav-link active"
              id="tab-formularios-btn"
              data-bs-toggle="tab"
              data-bs-target="#tabFormularios"
              type="button"
              role="tab"
              aria-controls="tabFormularios"
              aria-selected="true"
            >
              <i className="bi bi-list-ul me-1" aria-hidden="true"></i>Todos los formularios
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className="nav-link"
              id="tab-plantillas-btn"
              data-bs-toggle="tab"
              data-bs-target="#tabPlantillas"
              type="button"
              role="tab"
              aria-controls="tabPlantillas"
              aria-selected="false"
            >
              <i className="bi bi-file-earmark me-1" aria-hidden="true"></i>Todas las plantillas
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className="nav-link"
              id="tab-compartidos-btn"
              data-bs-toggle="tab"
              data-bs-target="#tabCompartidos"
              type="button"
              role="tab"
              aria-controls="tabCompartidos"
              aria-selected="false"
            >
              <i className="bi bi-share me-1" aria-hidden="true"></i>Formularios compartidos
            </button>
          </li>
        </ul>

        <div className="tab-content">
          <div className="tab-pane fade show active" id="tabFormularios" role="tabpanel" aria-labelledby="tab-formularios-btn">
            <div className="table-toolbar">
              <div className="d-flex align-items-center gap-2">
                <label htmlFor="entriesSelect" className="small text-muted mb-0">
                  Mostrar
                </label>
                <select className="form-select form-select-sm" style={{ width: 'auto' }} id="entriesSelect" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span className="small text-muted">entradas</span>
              </div>
            </div>

            <div aria-live="polite">
              {status === 'loading' && (
                <p className="text-muted py-4" role="status"><span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Cargando encuestas…</p>
              )}
              {status === 'error' && (
                <div className="alert alert-danger d-flex justify-content-between align-items-center" role="alert">
                  <span>{loadError}</span>
                  <button type="button" className="btn btn-outline-salir btn-sm" onClick={load}>Reintentar</button>
                </div>
              )}
              {status === 'ready' && encuestas.length === 0 && (
                <p className="text-muted py-4">Aún no tienes encuestas. Pulsa <strong>Nueva Encuesta</strong> para crear la primera.</p>
              )}
              {status === 'ready' && encuestas.length > 0 && encuestasFiltradas.length === 0 && (
                <p className="text-muted small" id="noResultsMsg">No se encontraron encuestas que coincidan con la búsqueda.</p>
              )}
            </div>

            {visibles.length > 0 && (
              <EncuestasTable encuestas={visibles} onShare={setSharing} onDuplicate={handleDuplicate} onDelete={handleDelete} />
            )}

            {totalPages > 1 && (
              <nav aria-label="Paginación de encuestas" className="d-flex justify-content-between align-items-center">
                <span className="small text-muted">Página {page} de {totalPages}</span>
                <div className="d-flex gap-2">
                  <button type="button" className="btn btn-outline-salir btn-sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Anterior</button>
                  <button type="button" className="btn btn-outline-salir btn-sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Siguiente</button>
                </div>
              </nav>
            )}
          </div>

          <div className="tab-pane fade" id="tabPlantillas" role="tabpanel" aria-labelledby="tab-plantillas-btn">
            <p className="text-muted mt-3">Las plantillas prediseñadas estarán disponibles próximamente. Mientras tanto, use la acción «Duplicar» en cualquier encuesta para reutilizarla como plantilla.</p>
          </div>
          <div className="tab-pane fade" id="tabCompartidos" role="tabpanel" aria-labelledby="tab-compartidos-btn">
            <p className="text-muted mt-3">Aún no hay formularios compartidos contigo.</p>
          </div>
        </div>
      </main>

      <SiteFooter columns={FOOTER_COLUMNS} />

      <NuevaEncuestaModal onCreate={handleCreateEncuesta} />
      <ShareModal form={sharing} onClose={() => setSharing(null)} onUpdated={handleUpdated} />
    </>
  );
}
