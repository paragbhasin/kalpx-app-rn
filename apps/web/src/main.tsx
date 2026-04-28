import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { App } from './App';
import { WEB_ENV } from './lib/env';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={WEB_ENV.googleClientId}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
);
