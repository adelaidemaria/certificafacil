
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import VerifyPage from './components/VerifyPage';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// Roteamento Simples
const path = window.location.pathname;

root.render(
  <React.StrictMode>
    {path === '/verificar' || path === '/verificar/' ? <VerifyPage /> : <App />}
  </React.StrictMode>
);
