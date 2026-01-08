import React from 'react';
import ReactDOM from 'react-dom/client';
import { InventarioProvider } from './context/InventarioContext.jsx';
import AppRoutes from './routes/AppRoutes.jsx';
import './styles/global.css';
import { ToastProvider } from './context/ToastContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastProvider>
      <InventarioProvider>
        <AppRoutes />
      </InventarioProvider>
    </ToastProvider>
  </React.StrictMode>
);
