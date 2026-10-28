import React, { useEffect, useRef } from 'react';
import { Carousel } from 'bootstrap';
import heroSlides from '../data/heroSlides.js';

/** Convierte los saltos de línea "\n" del texto en elementos <br />. */
function renderWithLineBreaks(text) {
  return text.split('\n').map((line, index, arr) => (
    <React.Fragment key={line}>
      {line}
      {index < arr.length - 1 && <br />}
    </React.Fragment>
  ));
}

/**
 * HeroCarousel
 * ------------------------------------------------------------------
 * Carrusel de bienvenida de la página de inicio. Las diapositivas se
 * generan a partir de `data/heroSlides.js` (igual que hacía
 * js/carousel.js dinámicamente sobre el DOM), y el comportamiento de
 * auto-avance/control por hover se delega en el propio Carousel de
 * Bootstrap, inicializado sobre la referencia del contenedor.
 */
export default function HeroCarousel() {
  const carouselRef = useRef(null);

  useEffect(() => {
    if (!carouselRef.current) return undefined;
    const instance = new Carousel(carouselRef.current, {
      interval: 5000,
      ride: 'carousel',
      pause: 'hover',
    });
    // Libera la instancia de Bootstrap al desmontar el componente.
    return () => instance.dispose();
  }, []);

  return (
    <div className="hero-carousel">
      <div id="heroCarousel" className="carousel slide" ref={carouselRef} role="region" aria-label="Carrusel de presentación de EncuestSoft">
        <div className="carousel-inner">
          {heroSlides.map((slide, index) => (
            <div className={`carousel-item${index === 0 ? ' active' : ''}`} key={slide.img}>
              <div className="hero-card">
                <div className="row g-0">
                  <div className="col-md-6">
                    <div className="hero-slide-img-wrap">
                      <img
                        src={slide.img}
                        alt={slide.alt}
                        width="700"
                        height="320"
                        loading={index === 0 ? 'eager' : 'lazy'}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="hero-copy">
                      <p className="eyebrow-title">{renderWithLineBreaks(slide.eyebrow)}</p>
                      <p className="brand-name">{slide.brand}</p>
                      <p className="tagline">{slide.tagline}</p>
                      <p className="desc">{slide.desc}</p>
                      <div className="hero-badges">
                        <span className="badge-circle">
                          <img src="/images/udec-badge.svg" alt="Insignia UdeC" width="52" height="52" />
                        </span>
                        <span className="badge-circle">
                          <img src="/images/es-badge-gold.svg" alt="Insignia EncuestSoft" width="52" height="52" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="carousel-control-prev" type="button" data-bs-target="#heroCarousel" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Anterior</span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#heroCarousel" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Siguiente</span>
        </button>

        <div className="carousel-indicators position-relative mt-3">
          {heroSlides.map((slide, index) => (
            <button
              key={slide.img}
              type="button"
              data-bs-target="#heroCarousel"
              data-bs-slide-to={index}
              className={index === 0 ? 'active' : ''}
              aria-current={index === 0 ? 'true' : undefined}
              aria-label={`Ir a la diapositiva ${index + 1}`}
            ></button>
          ))}
        </div>
      </div>
    </div>
  );
}
