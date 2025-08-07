import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './ThemeContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import './i18n';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { TimezoneProvider } from './contexts/TimezoneContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <CurrencyProvider>
      <TimezoneProvider>
        <ThemeProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ThemeProvider>
      </TimezoneProvider>
    </CurrencyProvider>
  </React.StrictMode>
); 