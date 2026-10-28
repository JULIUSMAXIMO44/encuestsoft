import React, { useEffect, useRef } from 'react';

const SCRIPT_ID = 'google-recaptcha-script';

/**
 * Casilla reCAPTCHA v2 (protección AntiSpam). Carga el script de Google solo cuando
 * el formulario lo requiere y entrega el token al padre mediante `onToken`.
 * @param {{ siteKey: string, onToken: (token: string) => void }} props
 */
export default function Recaptcha({ siteKey, onToken }) {
  const holderRef = useRef(null);

  useEffect(() => {
    if (!siteKey) return undefined;
    let widgetId = null;

    const render = () => {
      if (!holderRef.current || !window.grecaptcha?.render || holderRef.current.childElementCount) return;
      widgetId = window.grecaptcha.render(holderRef.current, {
        sitekey: siteKey,
        callback: onToken,
        'expired-callback': () => onToken(''),
      });
    };

    if (window.grecaptcha?.render) {
      render();
    } else {
      window.__onRecaptchaLoaded = render;
      if (!document.getElementById(SCRIPT_ID)) {
        const s = document.createElement('script');
        s.id = SCRIPT_ID;
        s.src = 'https://www.google.com/recaptcha/api.js?onload=__onRecaptchaLoaded&render=explicit&hl=es';
        s.async = true;
        document.head.appendChild(s);
      }
    }
    return () => {
      if (widgetId !== null) window.grecaptcha?.reset?.(widgetId);
    };
  }, [siteKey, onToken]);

  return (
    <div className="mb-3">
      <p className="small text-muted mb-1" id="recaptcha-help">Verificación de seguridad: confirme que no es un robot.</p>
      <div ref={holderRef} aria-describedby="recaptcha-help"></div>
    </div>
  );
}
