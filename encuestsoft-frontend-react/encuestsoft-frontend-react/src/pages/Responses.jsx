/**
 * Responses — resultados de una encuesta.
 * ------------------------------------------------------------------
 * Pestañas: Resumen (GET /reports/general), Por pregunta (GET /reports/fields)
 * y Respuestas (GET /submissions, con detalle, PDF, eliminación y exportación CSV/XLSX).
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SimpleAppNav from '../components/SimpleAppNav.jsx';
import SimpleFooter from '../components/SimpleFooter.jsx';
import BarList from '../components/BarList.jsx';
import { formsApi, reportsApi, submissionsApi } from '../services/api.js';
import { useUi } from '../context/UiContext.jsx';
import { formatDate, formatDateTime } from '../utils/format.js';

const TABS = [['resumen', 'Resumen'], ['preguntas', 'Por pregunta'], ['respuestas', 'Respuestas']];
const STATUS_ES = { completed: 'Completadas', draft: 'Borradores', spam: 'Spam' };
const show = (v) => (Array.isArray(v) ? v.join('; ') : v ?? '');

export default function Responses() {
  const { id } = useParams();
  const { notify, confirm } = useUi();
  const [tab, setTab] = useState('resumen');
  const [form, setForm] = useState(null);
  const [general, setGeneral] = useState(null);
  const [byField, setByField] = useState([]);
  const [subs, setSubs] = useState({ items: [], meta: { total: 0, page: 1, total_pages: 1 } });
  const [range, setRange] = useState({ from: '', to: '' });
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const [f, g, bf, s] = await Promise.all([
        formsApi.get(id),
        reportsApi.general(id, { from: range.from ? new Date(`${range.from}T00:00:00`).toISOString() : '', to: range.to ? new Date(`${range.to}T23:59:59`).toISOString() : '' }),
        reportsApi.fields(id),
        submissionsApi.list(id, { page, page_size: 25 }),
      ]);
      setForm(f); setGeneral(g); setByField(bf); setSubs(s);
      setStatus('ready');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }, [id, range, page]);
  useEffect(() => { load(); }, [load]);

  async function download(kind, format) {
    setBusy(format);
    try {
      await submissionsApi.exportAll(id, format, form.slug || 'respuestas');
      notify(`Exportación ${kind} descargada.`);
    } catch (err) { notify(err.message); } finally { setBusy(''); }
  }

  async function removeSubmission(s) {
    const ok = await confirm({ title: 'Eliminar respuesta', message: `¿Eliminar la respuesta ${s.reference_id}? Esta acción no se puede deshacer.`, confirmLabel: 'Eliminar', danger: true });
    if (!ok) return;
    try {
      await submissionsApi.remove(id, s.id);
      setDetail(null);
      notify('Respuesta eliminada.');
      load();
    } catch (err) { notify(err.message); }
  }

  const fieldList = (form?.fields || []).filter((f) => !['heading', 'paragraph', 'divider', 'recaptcha'].includes(f.field_type));
  const num = (v) => Number(v) || 0;

  return (
    <>
      <SimpleAppNav />
      <main className="container-xl page-main" id="main-content">
        <div className="simple-page-header">
          <p className="breadcrumb-nav"><Link to="/">Inicio</Link> / <Link to="/dashboard">Panel</Link> / Resultados</p>
          <h1>Resultados{form ? `: ${form.title}` : ''}</h1>
        </div>

        {status === 'loading' && <p role="status" className="py-4"><span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Cargando resultados…</p>}
        {status === 'error' && <div className="alert alert-danger" role="alert">{error} <button type="button" className="btn btn-outline-salir btn-sm ms-2" onClick={load}>Reintentar</button></div>}

        {status === 'ready' && (
          <>
            <div className="d-flex flex-wrap gap-3 align-items-end justify-content-between mb-3">
              <form className="d-flex gap-2 align-items-end flex-wrap" onSubmit={(e) => e.preventDefault()} aria-label="Filtrar por fecha">
                <div><label htmlFor="r-from" className="form-label small mb-1">Desde</label><input id="r-from" type="date" className="form-control form-control-sm" value={range.from} onChange={(e) => { setRange((r) => ({ ...r, from: e.target.value })); setPage(1); }} /></div>
                <div><label htmlFor="r-to" className="form-label small mb-1">Hasta</label><input id="r-to" type="date" className="form-control form-control-sm" value={range.to} onChange={(e) => { setRange((r) => ({ ...r, to: e.target.value })); setPage(1); }} /></div>
                {(range.from || range.to) && <button type="button" className="btn btn-outline-salir btn-sm" onClick={() => setRange({ from: '', to: '' })}>Quitar filtro</button>}
              </form>
              <div className="d-flex gap-2" role="group" aria-label="Exportar respuestas">
                <button type="button" className="btn btn-outline-salir" disabled={!!busy} onClick={() => download('CSV', 'csv')}><i className="bi bi-filetype-csv me-1" aria-hidden="true"></i>{busy === 'csv' ? 'Descargando…' : 'Exportar CSV'}</button>
                <button type="button" className="btn btn-agregar-secciones" disabled={!!busy} onClick={() => download('Excel', 'xlsx')}><i className="bi bi-file-earmark-excel me-1" aria-hidden="true"></i>{busy === 'xlsx' ? 'Descargando…' : 'Exportar Excel'}</button>
              </div>
            </div>

            <ul className="nav nav-tabs mb-3" role="tablist" aria-label="Vistas de resultados">
              {TABS.map(([k, l]) => (
                <li className="nav-item" role="presentation" key={k}>
                  <button type="button" role="tab" id={`rt-${k}`} className={`nav-link${tab === k ? ' active' : ''}`} aria-selected={tab === k} aria-controls={`rp-${k}`} tabIndex={tab === k ? 0 : -1} onClick={() => setTab(k)}>{l}</button>
                </li>
              ))}
            </ul>

            {tab === 'resumen' && (
              <div role="tabpanel" id="rp-resumen" aria-labelledby="rt-resumen">
                <div className="row summary-row g-3 mb-4">
                  <div className="col-sm-4"><div className="summary-card"><div className="summary-icon envios"><i className="bi bi-hand-index-thumb" aria-hidden="true"></i></div><div><div className="summary-count">{general.total_submissions}</div><div className="summary-label">Respuestas recibidas</div></div></div></div>
                  <div className="col-sm-4"><div className="summary-card"><div className="summary-icon formularios"><i className="bi bi-eye" aria-hidden="true"></i></div><div><div className="summary-count">{form.views_count ?? 0}</div><div className="summary-label">Visitas al formulario</div></div></div></div>
                  <div className="col-sm-4"><div className="summary-card"><div className="summary-icon plantillas"><i className="bi bi-percent" aria-hidden="true"></i></div><div><div className="summary-count">{form.views_count ? Math.round((num(form.submissions_count) / form.views_count) * 100) : 0}%</div><div className="summary-label">Tasa de respuesta</div></div></div></div>
                </div>
                <div className="row g-3">
                  <div className="col-lg-7 content-card">
                    <h2 className="h5">Respuestas por día</h2>
                    {general.submissions_by_day.length ? <BarList label="Respuestas por día" items={general.submissions_by_day.map((d) => ({ label: formatDate(d.day), value: num(d.count) }))} /> : <p className="text-muted mb-0">No hay respuestas en el periodo seleccionado.</p>}
                  </div>
                  <div className="col-lg-5 content-card">
                    <h2 className="h5">Estado de las respuestas</h2>
                    {general.submissions_by_status.length ? <BarList label="Respuestas por estado" items={general.submissions_by_status.map((d) => ({ label: STATUS_ES[d.status] || d.status, value: num(d.count) }))} /> : <p className="text-muted mb-0">Sin datos.</p>}
                  </div>
                </div>
              </div>
            )}

            {tab === 'preguntas' && (
              <div role="tabpanel" id="rp-preguntas" aria-labelledby="rt-preguntas" className="row g-3">
                {byField.length === 0 && <p className="text-muted">Este formulario aún no tiene preguntas.</p>}
                {byField.map((f) => (
                  <div className="col-lg-6" key={f.field_id}>
                    <article className="content-card h-100">
                      <h2 className="h6">{f.label}</h2>
                      <p className="small text-muted">{num(f.answered_count)} respuesta(s)</p>
                      {f.distribution?.length > 0 && <BarList label={`Distribución de ${f.label}`} items={f.distribution.map((d) => ({ label: d.value_text, value: num(d.count) }))} />}
                      {f.average != null && (
                        <dl className="row mb-0 small">
                          <dt className="col-6">Promedio</dt><dd className="col-6">{Number(f.average).toFixed(2)}</dd>
                          <dt className="col-6">Mínimo</dt><dd className="col-6">{f.min}</dd>
                          <dt className="col-6">Máximo</dt><dd className="col-6">{f.max}</dd>
                        </dl>
                      )}
                    </article>
                  </div>
                ))}
              </div>
            )}

            {tab === 'respuestas' && (
              <div role="tabpanel" id="rp-respuestas" aria-labelledby="rt-respuestas">
                {subs.items.length === 0 ? <p className="text-muted">Todavía no hay respuestas.</p> : (
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <caption className="visually-hidden">Respuestas recibidas</caption>
                      <thead><tr><th scope="col">Referencia</th><th scope="col">Fecha</th><th scope="col">Correo</th>{fieldList.slice(0, 3).map((f) => <th scope="col" key={f.id}>{f.label}</th>)}<th scope="col">Acciones</th></tr></thead>
                      <tbody>
                        {subs.items.map((s) => (
                          <tr key={s.id}>
                            <td className="fw-semibold">{s.reference_id}</td><td>{formatDateTime(s.submitted_at)}</td><td>{s.respondent_email || '—'}</td>
                            {fieldList.slice(0, 3).map((f) => <td key={f.id}>{show(s.raw_answers_json?.[f.field_key])}</td>)}
                            <td>
                              <div className="action-icons">
                                <button type="button" className="action-btn action-view" aria-label={`Ver detalle de ${s.reference_id}`} title="Ver detalle" onClick={() => setDetail(s)}><i className="bi bi-eye" aria-hidden="true"></i></button>
                                <button type="button" className="action-btn action-delete" aria-label={`Eliminar ${s.reference_id}`} title="Eliminar" onClick={() => removeSubmission(s)}><i className="bi bi-trash" aria-hidden="true"></i></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {subs.meta.total_pages > 1 && (
                  <nav aria-label="Paginación de respuestas" className="d-flex justify-content-between align-items-center">
                    <span className="small text-muted">Página {subs.meta.page} de {subs.meta.total_pages} ({subs.meta.total} respuestas)</span>
                    <div className="d-flex gap-2">
                      <button type="button" className="btn btn-outline-salir btn-sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Anterior</button>
                      <button type="button" className="btn btn-outline-salir btn-sm" disabled={page >= subs.meta.total_pages} onClick={() => setPage((p) => p + 1)}>Siguiente</button>
                    </div>
                  </nav>
                )}

                {detail && (
                  <section className="content-card mt-3" aria-labelledby="detail-title" tabIndex="-1" ref={(el) => el?.focus()}>
                    <div className="d-flex justify-content-between flex-wrap gap-2">
                      <h2 className="h5" id="detail-title">Respuesta {detail.reference_id}</h2>
                      <div className="d-flex gap-2">
                        {form.submission_pdf_enabled && <button type="button" className="btn btn-outline-salir btn-sm" onClick={() => submissionsApi.pdf(id, detail.id, detail.reference_id).catch((e) => notify(e.message))}><i className="bi bi-file-earmark-pdf me-1" aria-hidden="true"></i>Descargar PDF</button>}
                        <button type="button" className="btn btn-outline-salir btn-sm" onClick={() => setDetail(null)}>Cerrar detalle</button>
                      </div>
                    </div>
                    <dl className="row mb-0">
                      {fieldList.map((f) => (<React.Fragment key={f.id}><dt className="col-sm-4">{f.label}</dt><dd className="col-sm-8">{show(detail.raw_answers_json?.[f.field_key]) || '—'}</dd></React.Fragment>))}
                      {detail.files?.length > 0 && <><dt className="col-sm-4">Archivos</dt><dd className="col-sm-8">{detail.files.map((x) => x.original_name || x.file_name).join(', ')}</dd></>}
                    </dl>
                  </section>
                )}
              </div>
            )}
          </>
        )}
      </main>
      <SimpleFooter />
    </>
  );
}
