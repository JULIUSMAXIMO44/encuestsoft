import { useId, useState } from 'react';
import { EyeIcon, EyeOffIcon } from './Icons.jsx';

// Campo con etiqueta, ayuda y error asociados (aria-describedby).
// Con type="password" agrega el botón para mostrar u ocultar la contraseña.
export default function FormField({ label, error, hint, type = 'text', ...inputProps }) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;
  const isPassword = type === 'password';

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="input-wrap">
        <input
          id={id}
          type={isPassword && visible ? 'text' : type}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          {...inputProps}
        />
        {isPassword && (
          <button
            type="button"
            className="input-toggle"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            aria-pressed={visible}
          >
            {visible ? <EyeOffIcon width={16} height={16} /> : <EyeIcon width={16} height={16} />}
          </button>
        )}
      </div>
      {hint && (
        <p id={hintId} className="field-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}
