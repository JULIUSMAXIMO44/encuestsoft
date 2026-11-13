import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForms } from '../hooks/useForms.js';
import Tabs from '../components/Tabs.jsx';
import NewSurveyModal from '../components/NewSurveyModal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Alert from '../components/Alert.jsx';
import {
  PlusIcon,
  SearchIcon,
  EyeIcon,
  PencilIcon,
  ListIcon,
  ShareIcon,
  ReportIcon,
  PieIcon,
  CopyIcon,
  TrashIcon,
  InboxIcon,
  NotebookIcon,
  FileIcon,
  HandPointIcon,
} from '../components/Icons.jsx';

const PAGE_SIZES = [10, 25, 50, 100];
const STATUS = {
  draft: { label: 'Borrador', cls: 'badge-draft' },
  published: { label: 'Publicado', cls: 'badge-published' },
  paused: { label: 'Pausado', cls: 'badge-paused' },
  archived: { label: 'Archivado', cls: 'badge-archived' },
};
const SORTS = {
  recent: { label: 'Más recientes', fn: (a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0) },
  name: { label: 'Nombre (A-Z)', fn: (a, b) => a.title.localeCompare(b.title, 'es') },
  responses: { label: 'Más respuestas', fn: (a, b) => (b.submissions_count || 0) - (a.submissions_count || 0) },
};

const dateFmt = new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
const formatDate = (v) => (v ? dateFmt.format(new Date(v)) : '—');

function Stat({ label, value, tone, children }) {
  return (
    <div className="stat">
      <span className={`stat-icon tone-${tone}`} aria-hidden="true">
        {children}
      </span>
      <span className="stat-text">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
      </span>
    </div>
  );
}

// Botón de ícono con nombre accesible y rótulo visible al pasar el puntero.
function Action({ label, to, href, onClick, tone, children }) {
  const props = { className: `icon-action tone-${tone}`, title: label, 'aria-label': label };
  if (to) return <Link to={to} {...props}>{children}</Link>;
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props} aria-label={`${label} (se abre en una pestaña nueva)`}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} {...props}>
      {children}
    </button>
  );
}

function FormRow({ form, onDuplicate, onDelete }) {
  const status = STATUS[form.status] || STATUS.draft;
  const total = form.submissions_count || 0;
  const today = form.submissions_today || 0;
  return (
    <tr>
      <td className="cell-id">{form.id}</td>
      <th scope="row" className="cell-name">
        <Link to={`/constructor/${form.id}`}>{form.title}</Link>
      </th>
      <td className="cell-desc">{form.description || '—'}</td>
      <td>
        <span className={`badge ${status.cls}`}>{status.label}</span>
      </td>
      <td className="cell-date">{formatDate(form.created_at || form.updated_at)}</td>
      <td>
        <Link to={`/formularios/${form.id}/respuestas`} className="resp-link" aria-label={`${total} respuestas de ${form.title}`}>
          {total}
        </Link>
        {today > 0 && <span className="badge badge-today">{today} hoy</span>}
      </td>
      <td>
        <div className="actions" role="group" aria-label={`Acciones de ${form.title}`}>
          <Action label="Ver encuesta" tone="view" href={`/f/${form.uuid}`}>
            <EyeIcon width={15} height={15} />
          </Action>
          <Action label="Editar" tone="edit" to={`/constructor/${form.id}`}>
            <PencilIcon width={15} height={15} />
          </Action>
          <Action label="Compartir" tone="share" to={`/constructor/${form.id}/publicar`}>
            <ShareIcon width={15} height={15} />
          </Action>
          <Action label="Duplicar" tone="copy" onClick={() => onDuplicate(form)}>
            <CopyIcon width={15} height={15} />
          </Action>
          <Action label="Respuestas" tone="data" to={`/formularios/${form.id}/respuestas`}>
            <ListIcon width={15} height={15} />
          </Action>
          <Action label="Reporte" tone="data" to={`/formularios/${form.id}/reporte`}>
            <ReportIcon width={15} height={15} />
          </Action>
          <Action label="Analítica" tone="stats" to={`/formularios/${form.id}/analitica`}>
            <PieIcon width={15} height={15} />
          </Action>
          <Action label="Eliminar" tone="delete" onClick={() => onDelete(form)}>
            <TrashIcon width={15} height={15} />
          </Action>
        </div>
      </td>
    </tr>
  );
}

function Empty({ children }) {
  return (
    <div className="empty-state">
      <InboxIcon width={28} height={28} />
      <p>{children}</p>
    </div>
  );
}

export default function Dashboard() {
  const { forms, loading, error, reload, create, duplicate, remove } = useForms();
  const [tab, setTab] = useState('formularios');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('recent');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [showNew, setShowNew] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] = useState('');

  const totals = useMemo(
    () => ({
      forms: forms.length,
      submissions: forms.reduce((n, f) => n + (f.submissions_count || 0), 0),
    }),
    [forms]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return forms
      .filter((f) => !q || f.title.toLowerCase().includes(q) || (f.description || '').toLowerCase().includes(q))
      .sort(SORTS[sort].fn);
  }, [forms, query, sort]);

  const pages = Math.max(1, Math.ceil(visible.length / pageSize));
  const current = Math.min(page, pages);
  const rows = visible.slice((current - 1) * pageSize, current * pageSize);

  const onDuplicate = async (form) => {
    setActionError('');
    try {
      await duplicate(form.id);
      setNotice(`Se duplicó “${form.title}”.`);
    } catch (err) {
      setActionError(err.message);
    }
  };

  const tabs = [
    { id: 'formularios', label: 'Todos los formularios', icon: <ListIcon width={14} height={14} /> },
    { id: 'plantillas', label: 'Todas las plantillas', icon: <FileIcon width={14} height={14} /> },
    { id: 'compartidos', label: 'Formularios compartidos', icon: <ShareIcon width={14} height={14} /> },
  ];

  return (
    <div className="dash">
      <h1 className="dash-title">Crear encuestas</h1>
      <p className="dash-help">
        Para <strong>CREAR</strong> una nueva encuesta, presione el botón verde <strong>Nueva Encuesta</strong>. Para{' '}
        <strong>ACCEDER</strong> a una encuesta existente, dé clic sobre el nombre de la encuesta que vaya a revisar.
      </p>
      <h2 className="dash-sub">Resumen acciones ENCUESTSOFT UDC</h2>

      <div className="stats" role="group" aria-label="Resumen">
        <Stat label="Formularios" value={totals.forms} tone="blue">
          <NotebookIcon width={18} height={18} />
        </Stat>
        <Stat label="Plantillas" value={0} tone="yellow">
          <FileIcon width={18} height={18} />
        </Stat>
        <Stat label="Envíos" value={totals.submissions} tone="red">
          <HandPointIcon width={18} height={18} />
        </Stat>
        <button type="button" className="btn btn-primary btn-new" onClick={() => setShowNew(true)}>
          <PlusIcon width={16} height={16} /> Nueva Encuesta
        </button>
      </div>

      <Alert kind="info">{notice}</Alert>
      <Alert>{actionError}</Alert>

      <Tabs tabs={tabs} value={tab} onChange={setTab}>
        {tab === 'formularios' && (
          <section className="panel" aria-label="Formularios">
            <div className="toolbar">
              <label className="show-entries">
                <span>Mostrar</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                >
                  {PAGE_SIZES.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <span>entradas</span>
              </label>
              <div className="toolbar-right">
                <label className="sort">
                  <span>Ordenar por</span>
                  <select value={sort} onChange={(e) => setSort(e.target.value)}>
                    {Object.entries(SORTS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="search">
                  <SearchIcon width={16} height={16} />
                  <label htmlFor="buscar" className="sr-only">
                    Buscar formularios
                  </label>
                  <input
                    id="buscar"
                    type="search"
                    placeholder="Buscar formularios"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>
              </div>
            </div>

            {loading && (
              <p className="state" role="status">
                Cargando formularios…
              </p>
            )}
            {!loading && error && (
              <div className="state">
                <Alert>{error}</Alert>
                <button type="button" className="btn btn-outline btn-sm" onClick={reload}>
                  Reintentar
                </button>
              </div>
            )}
            {!loading && !error && forms.length === 0 && (
              <Empty>Aún no tienes encuestas. Crea la primera con “Nueva Encuesta”.</Empty>
            )}
            {!loading && !error && forms.length > 0 && visible.length === 0 && <Empty>Ningún formulario coincide con la búsqueda.</Empty>}

            {!loading && !error && rows.length > 0 && (
              <>
                <div className="table-wrap" tabIndex="0" role="region" aria-label="Tabla de formularios">
                  <table className="table">
                    <caption className="sr-only">Formularios y encuestas del workspace</caption>
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
                    <tbody>
                      {rows.map((f) => (
                        <FormRow key={f.id} form={f} onDuplicate={onDuplicate} onDelete={setToDelete} />
                      ))}
                    </tbody>
                  </table>
                </div>
                {pages > 1 && (
                  <nav className="pagination" aria-label="Paginación">
                    <button type="button" className="btn btn-outline btn-sm" disabled={current <= 1} onClick={() => setPage(current - 1)}>
                      Anterior
                    </button>
                    <span aria-live="polite">
                      Página {current} de {pages}
                    </span>
                    <button type="button" className="btn btn-outline btn-sm" disabled={current >= pages} onClick={() => setPage(current + 1)}>
                      Siguiente
                    </button>
                  </nav>
                )}
              </>
            )}
          </section>
        )}

        {tab === 'plantillas' && (
          <section className="panel" aria-label="Plantillas">
            <Empty>Las plantillas estarán disponibles próximamente.</Empty>
          </section>
        )}
        {tab === 'compartidos' && (
          <section className="panel" aria-label="Compartidos">
            <Empty>Aún no hay formularios compartidos contigo. Aparecerán cuando te inviten a un workspace.</Empty>
          </section>
        )}
      </Tabs>

      {showNew && <NewSurveyModal onClose={() => setShowNew(false)} onCreate={create} />}
      {toDelete && (
        <ConfirmDialog
          title="Eliminar encuesta"
          message={`¿Eliminar “${toDelete.title}”? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          danger
          onConfirm={async () => {
            await remove(toDelete.id);
            setNotice(`Se eliminó “${toDelete.title}”.`);
          }}
          onClose={() => setToDelete(null)}
        />
      )}
    </div>
  );
}
