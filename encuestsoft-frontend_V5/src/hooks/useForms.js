import { useCallback, useEffect, useState } from 'react';
import { formsApi } from '../services/formsApi.js';

// Lista y operaciones sobre los formularios del workspace actual.
export function useForms() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await formsApi.list();
      setForms(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = useCallback(async (payload) => {
    const { data } = await formsApi.create(payload);
    setForms((f) => [data, ...f]);
    return data;
  }, []);

  const duplicate = useCallback(async (id) => {
    const { data } = await formsApi.duplicate(id);
    setForms((f) => [data, ...f]);
    return data;
  }, []);

  const remove = useCallback(async (id) => {
    await formsApi.remove(id);
    setForms((f) => f.filter((x) => x.id !== id));
  }, []);

  return { forms, loading, error, reload: load, create, duplicate, remove };
}
