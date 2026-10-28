/** Utilidades de formato. */
export const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
};
export const formatDateTime = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
};
/** Convierte ISO a valor para <input type="datetime-local"> (hora local). */
export const toLocalInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};
export const STATUS_LABELS = { draft: 'Borrador', published: 'Publicado', paused: 'Pausado', archived: 'Archivado' };
export const ROLE_LABELS = { owner: 'Propietario', admin: 'Administrador', editor: 'Editor', viewer: 'Lector' };
