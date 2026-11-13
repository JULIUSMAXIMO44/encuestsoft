import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';

export default function PublicLayout() {
  return (
    <div className="page">
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <Header />
      <main id="contenido" tabIndex="-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
