import { Link } from 'react-router-dom';
import Carousel from '../components/Carousel.jsx';
import { ClipboardIcon, SendIcon, BarsIcon, ArrowRightIcon } from '../components/Icons.jsx';

// Los enlaces llevan a /ingresar: el inicio público nunca enlaza al panel.
const CARDS = [
  {
    Icon: ClipboardIcon,
    title: 'Crea encuestas en minutos',
    text: 'Diseña formularios de satisfacción a partir de plantillas o desde cero, con secciones y preguntas configurables.',
    link: 'Ingresar para crear encuestas',
  },
  {
    Icon: SendIcon,
    title: 'Envíos y seguimiento',
    text: 'Comparte tus encuestas y lleva el control de cuántas veces se han enviado y respondido.',
    link: 'Ingresar para ver envíos',
  },
  {
    Icon: BarsIcon,
    title: 'Resultados centralizados',
    text: 'Consulta formularios, plantillas y formularios compartidos desde un panel administrativo único.',
    link: 'Ingresar para ver resultados',
  },
];

export default function Home() {
  return (
    <>
      <Carousel />
      <section id="funcionalidades" className="cards" aria-label="Funcionalidades">
        <ul className="card-grid">
          {CARDS.map(({ Icon, title, text, link }) => (
            <li key={title} className="card">
              <Icon className="card-icon" width={22} height={22} />
              <h2>{title}</h2>
              <p>{text}</p>
              <Link to="/ingresar" className="card-link">
                {link}
                <ArrowRightIcon width={16} height={16} />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
