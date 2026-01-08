import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from '../components/Navbar';
import InventarioPage from '../pages/InventarioPage';
import EntradasPage from '../pages/EntradasPage';
import SalidasPage from '../pages/SalidasPage';
import EncargadosArea from '../pages/EncargadosArea';
import NuevaSalida from '../pages/NuevaSalida';

import NotaPedidoSemanal from '../pages/NotaPedidoSemanal';

const AppRoutes = () => (
  <Router basename="/front">
    <Navbar />
    <Routes>
      <Route path="/" element={<InventarioPage />} />
      <Route path="/entradas" element={<EntradasPage />} />
  <Route path="/salidas" element={<SalidasPage />} />
  <Route path="/nueva-salida" element={<NuevaSalida />} />
      <Route path="/encargados-area" element={<EncargadosArea />} />
  <Route path="/nota-pedido-semanal" element={<NotaPedidoSemanal />} />
    </Routes>
  </Router>
);

export default AppRoutes;
