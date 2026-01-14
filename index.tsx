import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AudienceProvider } from './contexts/AudienceContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AudienceProvider>
      <App />
    </AudienceProvider>
  </React.StrictMode>
);
