import { useEffect, useState, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

/**
 * Hook de ejemplo para consumir el schema público de un formulario de
 * ENCUESTSOFT y renderizarlo dinámicamente en React (drag & drop resultante).
 *
 * Uso:
 *   const { form, fields, loading, error } = useFormSchema(formUuid);
 */
export function useFormSchema(formUuid, formPassword) {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSchema = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/public/forms/${formUuid}`, {
        headers: formPassword ? { 'x-form-password': formPassword } : {},
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'No se pudo cargar el formulario.');
      setForm(json.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [formUuid, formPassword]);

  useEffect(() => {
    fetchSchema();
  }, [fetchSchema]);

  return { form, fields: form?.fields || [], loading, error, refetch: fetchSchema };
}
