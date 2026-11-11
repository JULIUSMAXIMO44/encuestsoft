import { Link } from 'react-router-dom';
import { useCarousel } from '../hooks/useCarousel.js';
import { ChevronLeftIcon, ChevronRightIcon, PauseIcon, PlayIcon, BarsIcon } from './Icons.jsx';
import { FormMock, PencilArt, MagnifierArt, ShareArt } from './SlideArt.jsx';

// Fondos de las imágenes de referencia, oscurecidos lo justo para que el texto
// blanco cumpla el contraste AA (4.5:1).
const SLIDES = [
  { id: 'portada', label: 'Portada', bg: 'linear-gradient(135deg,#5b95c0 0%,#3F6A9E 55%,#3a6590 100%)' },
  { id: 'crear', label: 'Crear encuesta', bg: '#8A6F5A' },
  { id: 'visualizar', label: 'Visualizar encuesta', bg: '#A5644B' },
  { id: 'compartir', label: 'Compartir encuesta', bg: '#9C5F55' },
  { id: 'resultados', label: 'Resultados de la encuesta', bg: '#9A5E17' },
  { id: 'invitacion', label: 'Úsala y renta ENCUESTSOFT', bg: '#1B6B3A' },
];

function Head({ children = 'Encuestsoft te permite:' }) {
  return (
    <div className="slide-head">
      <img src="/img/logo-es.png" alt="" width="34" height="34" />
      <span>{children}</span>
    </div>
  );
}

function Feature({ title, text, art, reverse }) {
  return (
    <>
      <div className="slide-text">
        <Head />
        <h2>{title}</h2>
        <p className="slide-desc">{text}</p>
      </div>
      <div className="polaroid">{art}</div>
    </>
  );
}

function SlideContent({ id }) {
  switch (id) {
    case 'portada':
      return (
        <>
          <div className="slide-art">
            <FormMock />
          </div>
          <div className="slide-text">
            <h2>Sistema de encuestas de satisfacción</h2>
            <p className="slide-brand">ENCUESTSOFT</p>
            <p className="slide-motto">“¡A un Click para mejorar!”</p>
            <p className="slide-desc">Plataforma generadora de formularios y encuestas personalizados sin código.</p>
            <div className="slide-logos">
              <img className="logo-round" src="/img/escudo-universidad.png" alt="Escudo de la Universidad de Cartagena" />
              <img className="logo-square" src="/img/logo-es.png" alt="Logo de ENCUESTSOFT" />
              <span className="slide-tagline">Siempre a la altura de los tiempos</span>
            </div>
          </div>
        </>
      );
    case 'crear':
      return <Feature title="1. Crear encuesta" text="Crea tu encuesta a la medida, de forma fácil y rápida." art={<PencilArt />} />;
    case 'visualizar':
      return (
        <Feature
          title="2. Visualizar encuesta"
          text="Visualiza previamente la encuesta antes de publicarla."
          art={<MagnifierArt />}
        />
      );
    case 'compartir':
      return (
        <Feature
          title="3. Compartir encuesta"
          text="Comparte con tus contactos la encuesta diseñada para conocer información de su percepción y satisfacción a través de una URL de enlace."
          art={<ShareArt />}
        />
      );
    case 'resultados':
      return (
        <>
          <div className="slide-text">
            <Head>Encuestsoft te permite obtener:</Head>
            <h2>4. Resultados de la encuesta</h2>
            <p className="slide-desc">
              Obtén resultados de tu encuesta, realiza informes, descárgalos y obtén un resumen del estado y progreso
              de la encuesta.
            </p>
          </div>
          <ul className="chips" aria-label="Opciones de resultados">
            <li>
              <BarsIcon width={16} height={16} /> Informes
            </li>
            <li>Descargas</li>
            <li>Respuestas</li>
            <li>Resumen</li>
          </ul>
        </>
      );
    default:
      return (
        <>
          <div className="slide-text">
            <Head />
            <h2>Todo en una sola plataforma</h2>
            <p className="slide-desc">
              Crea, visualiza, comparte y analiza tus encuestas sin escribir código. Úsala o renta ENCUESTSOFT para tu
              institución, empresa o proyecto.
            </p>
            <Link to="/ingresar" className="btn btn-light btn-sm">
              Ingresar
            </Link>
          </div>
          <ul className="chips chips-outline" aria-label="Funcionalidades">
            <li>Crear</li>
            <li>Visualizar</li>
            <li>Compartir</li>
            <li>Resultados</li>
          </ul>
        </>
      );
  }
}

export default function Carousel() {
  const total = SLIDES.length;
  const { index, next, prev, goTo, playing, togglePlay, pauseHandlers } = useCarousel(total);

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      next();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prev();
    }
  };

  return (
    <section
      className="carousel"
      aria-roledescription="carrusel"
      aria-label="Presentación de ENCUESTSOFT"
      onKeyDown={onKeyDown}
      {...pauseHandlers}
    >
      <div className="carousel-card">
        <div className="carousel-viewport" aria-live={playing ? 'off' : 'polite'}>
          {SLIDES.map((s, i) => (
            <div
              key={s.id}
              className="slide"
              role="group"
              aria-roledescription="diapositiva"
              aria-label={`${i + 1} de ${total}: ${s.label}`}
              hidden={i !== index}
              style={{ background: s.bg }}
            >
              <SlideContent id={s.id} />
            </div>
          ))}
        </div>
        <button type="button" className="arrow arrow-left" onClick={prev} aria-label="Diapositiva anterior">
          <ChevronLeftIcon width={18} height={18} />
        </button>
        <button type="button" className="arrow arrow-right" onClick={next} aria-label="Diapositiva siguiente">
          <ChevronRightIcon width={18} height={18} />
        </button>
      </div>

      <div className="carousel-nav">
        <div className="dots">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className="dot"
              aria-label={`Ir a la diapositiva ${i + 1}: ${s.label}`}
              aria-current={i === index ? 'true' : undefined}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
        <button
          type="button"
          className="pause"
          onClick={togglePlay}
          aria-label={playing ? 'Pausar avance automático' : 'Reanudar avance automático'}
        >
          {playing ? <PauseIcon width={14} height={14} /> : <PlayIcon width={14} height={14} />}
        </button>
      </div>
    </section>
  );
}
