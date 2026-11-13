// Tarjeta central de las pantallas de acceso: título, logos y contenido.
export default function AuthCard({ title = 'Encuestsoft', children, ...formProps }) {
  return (
    <div className="auth-page">
      <form className="auth-card" noValidate {...formProps}>
        <h1>{title}</h1>
        <div className="auth-logos">
          <img className="logo-round" src="/img/escudo-universidad.png" alt="Universidad de Cartagena" />
          <img className="logo-square" src="/img/logo-es.png" alt="EncuestSoft" />
        </div>
        {children}
      </form>
    </div>
  );
}
