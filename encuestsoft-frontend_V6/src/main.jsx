import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { AccessibilityProvider } from './context/AccessibilityContext.jsx';
import AccessibilityWidget from './components/AccessibilityWidget.jsx';
import HelpButton from './components/HelpButton.jsx';
import './styles/theme.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AccessibilityProvider>
        <AuthProvider>
          <App />
          {/* Siempre presentes, en cualquier pantalla de la plataforma */}
          <AccessibilityWidget />
          <HelpButton />
        </AuthProvider>
      </AccessibilityProvider>
    </BrowserRouter>
  </React.StrictMode>
);
