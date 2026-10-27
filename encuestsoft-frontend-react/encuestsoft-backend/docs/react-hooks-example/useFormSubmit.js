import { useState, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

/**
 * Hook de ejemplo para enviar las respuestas de un formulario público,
 * incluyendo archivos adjuntos (multipart/form-data) cuando existan.
 *
 * Uso:
 *   const { submit, submitting, result, error } = useFormSubmit(formUuid);
 *   await submit({ nombre: 'Ana', correo: 'ana@mail.com', foto: fileInputList });
 */
export function useFormSubmit(formUuid) {
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const submit = useCallback(async (answers, { recaptchaToken } = {}) => {
    setSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      Object.entries(answers).forEach(([key, value]) => {
        if (value instanceof FileList) {
          Array.from(value).forEach((file) => formData.append(key, file));
        } else if (Array.isArray(value)) {
          value.forEach((v) => formData.append(key, v));
        } else if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
      if (recaptchaToken) formData.append('recaptcha_token', recaptchaToken);

      const res = await fetch(`${API_BASE}/public/forms/${formUuid}/submit`, {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) {
        const err = new Error(json.message || 'Error al enviar el formulario.');
        err.fieldErrors = json.errors;
        throw err;
      }
      setResult(json.data);
      return json.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [formUuid]);

  return { submit, submitting, result, error };
}
