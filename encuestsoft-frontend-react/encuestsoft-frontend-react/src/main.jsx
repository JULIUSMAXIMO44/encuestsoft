import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// Bootstrap 5: hojas de estilo y bundle de JS (maneja modales, tabs, dropdowns
// y el carrusel a través de los atributos data-bs-*, igual que en el
// prototipo HTML original).
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Hoja de estilos propia de EncuestSoft (portada 1:1 desde el prototipo).
import './assets/styles/style.css';

import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { A11yProvider } from './context/A11yContext.jsx';
import { UiProvider } from './context/UiContext.jsx';

// Punto de montaje de la aplicación. `BrowserRouter` habilita la navegación
// por rutas (React Router) que reemplaza la navegación entre archivos .html
// del prototipo original.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <A11yProvider>
          <UiProvider>
            <App />
          </UiProvider>
        </A11yProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
