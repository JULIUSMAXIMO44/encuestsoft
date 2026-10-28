/**
 * Datos de las diapositivas del carrusel de la página de inicio.
 * Mantenerlos separados del componente permite editar los textos e
 * imágenes sin tocar la lógica de render (mismo criterio que el
 * arreglo `slides` de js/carousel.js en el prototipo original).
 */
const heroSlides = [
  {
    img: '/images/hero-slide-1.svg',
    alt: 'Ilustración de una encuesta con preguntas marcadas y un botón de enviar',
    eyebrow: 'SISTEMA DE ENCUESTAS DE\nSATISFACCIÓN',
    brand: 'ENCUESTSOFT',
    tagline: '"A un Click para mejorar!"',
    desc: 'Conozca la opinión de los Suyos.',
  },
  {
    img: '/images/hero-slide-2.svg',
    alt: 'Ilustración de plantillas de documentos para crear encuestas',
    eyebrow: 'CREA ENCUESTAS EN\nMINUTOS',
    brand: 'ENCUESTSOFT',
    tagline: '"Diseña, envía y analiza"',
    desc: 'Plantillas listas para tus procesos de autoevaluación.',
  },
  {
    img: '/images/hero-slide-3.svg',
    alt: 'Ilustración de un panel con gráficas de resultados de encuestas',
    eyebrow: 'RESULTADOS\nCENTRALIZADOS',
    brand: 'ENCUESTSOFT',
    tagline: '"Toda la información en un solo lugar"',
    desc: 'Consulta formularios, plantillas y envíos desde un panel único.',
  },
];

export default heroSlides;
