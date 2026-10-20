import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { EmbedApp } from './EmbedApp.tsx';
import './index.css';

const isEmbed = 
  window.location.pathname === '/embed' || 
  window.location.search.includes('embed=true') ||
  window.self !== window.top;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isEmbed ? <EmbedApp /> : <App />}
  </StrictMode>
);
