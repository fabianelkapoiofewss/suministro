import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generarReportePDF } from '../components/reportes';
import { useToast } from '../context/ToastContext.jsx';
import API_URL from '../config/api';

const SalidasPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedDestinatario, setSelectedDestinatario] = useState('');
  const [searchArticulo, setSearchArticulo] = useState('');
  const [salidas, setSalidas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [yearsAvailable, setYearsAvailable] = useState([]);

  // Formatear fecha a dd-mm-yyyy
  function formatFecha(fechaStr) {
    if (!fechaStr) return '';
    const [y, m, d] = fechaStr.slice(0,10).split('-');
    return `${d}-${m}-${y}`;
  }

  // Cargar años disponibles y salidas del mes actual al montar
  useEffect(() => {
    cargarYearsDisponibles();
    cargarTodasSalidas();
  }, []);

  // Cargar todas las salidas
  const cargarTodasSalidas = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/salidas`);
      const data = await res.json();
      setSalidas(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast('Error al cargar salidas: ' + err.message, 'error');
      setSalidas([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar años disponibles
  const cargarYearsDisponibles = async () => {
    try {
      const res = await fetch(`${API_URL}/salidas`);
      const data = await res.json();
      const years = [...new Set(data.map(s => s.fecha ? new Date(s.fecha).getFullYear() : null).filter(Boolean))];
      setYearsAvailable(years.sort((a, b) => b - a));
    } catch (err) {
      console.error('Error cargando años:', err);
    }
  };

  // Filtrar salidas automáticamente cuando cambien los filtros
  const [allSalidas, setAllSalidas] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/salidas`);
        const data = await res.json();
        setAllSalidas(Array.isArray(data) ? data : []);
      } catch (err) {
        setAllSalidas([]);
      }
    })();
  }, []);

  useEffect(() => {
    let filtered = [...allSalidas];

    // Filtrar por mes/año
    if (selectedMonth && selectedYear) {
      filtered = filtered.filter(s => {
        if (!s.fecha) return false;
        const date = new Date(s.fecha);
        return date.getMonth() + 1 === Number(selectedMonth) && date.getFullYear() === Number(selectedYear);
      });
    }

    // Filtrar por área si está escrita
    if (selectedArea) {
      filtered = filtered.filter(s => 
        s.area && s.area.toLowerCase().includes(selectedArea.toLowerCase())
      );
    }

    // Filtrar por destinatario si está escrito
    if (selectedDestinatario) {
      filtered = filtered.filter(s => 
        s.destinatario && s.destinatario.toLowerCase().includes(selectedDestinatario.toLowerCase())
      );
    }

    // Filtrar por artículo si está escrito
    if (searchArticulo) {
      filtered = filtered.filter(s => 
        (s.articulo && s.articulo.toLowerCase().includes(searchArticulo.toLowerCase())) ||
        (s.codigo && s.codigo.toLowerCase().includes(searchArticulo.toLowerCase()))
      );
    }

    // Ordenar por fecha descendente
    filtered.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    setSalidas(filtered);
  }, [selectedMonth, selectedYear, selectedArea, selectedDestinatario, searchArticulo, allSalidas]);

  // Limpiar filtros
  const limpiarFiltros = () => {
    setSelectedMonth(new Date().getMonth() + 1);
    setSelectedYear(new Date().getFullYear());
    setSelectedArea('');
    setSelectedDestinatario('');
    setSearchArticulo('');
  };

  // Agrupar salidas por área y destinatario para PDF
  const getGroupedSalidas = () => {
    const grupos = {};
    salidas.forEach(s => {
      const area = s.area || 'Sin área';
      const destinatario = s.destinatario || 'Sin destinatario';
      
      if (!grupos[area]) grupos[area] = {};
      if (!grupos[area][destinatario]) grupos[area][destinatario] = [];
      
      grupos[area][destinatario].push(s);
    });
    return grupos;
  };

  // Agrupar salidas solo por destinatario para vista
  const getGroupedSalidasPorDestinatario = () => {
    const grupos = {};
    salidas.forEach(s => {
      const destinatario = s.destinatario || 'Sin destinatario';
      if (!grupos[destinatario]) grupos[destinatario] = [];
      grupos[destinatario].push(s);
    });
    return grupos;
  };

  return (
    <div className="page">
      {/* Flecha para retroceder */}
      <button
        onClick={() => navigate(-1)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          fontSize: '1rem',
          color: '#1976d2',
          fontWeight: 600
        }}
        aria-label="Volver"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 8 }}>
          <path d="M15 18L9 12L15 6" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Volver
      </button>

      <div style={{ 
        background: '#fff', 
        borderRadius: 8, 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
        padding: '20px',
        marginBottom: 20
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#2d3e50', fontSize: '1.5rem' }}>
          Historial de Salidas
        </h2>
        
        {/* Filtros */}
        <div style={{ 
          background: '#f8f9fa', 
          padding: '20px', 
          borderRadius: 6,
          marginBottom: 20
        }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 160px' }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.85rem' }}>Mes</label>
              <select 
                value={selectedMonth} 
                onChange={e => setSelectedMonth(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid #cbd3dd', width: '100%', fontSize: '0.9rem' }}
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i+1} value={i+1}>
                    {new Date(2000, i, 1).toLocaleString('es', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ flex: '1 1 120px' }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.85rem' }}>Año</label>
              <select 
                value={selectedYear} 
                onChange={e => setSelectedYear(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid #cbd3dd', width: '100%', fontSize: '0.9rem' }}
              >
                {yearsAvailable.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.85rem' }}>Área</label>
              <input
                type="text"
                placeholder="Filtrar por área..."
                value={selectedArea}
                onChange={e => setSelectedArea(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid #cbd3dd', width: '100%', fontSize: '0.9rem' }}
              />
            </div>

            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.85rem' }}>Destinatario</label>
              <input
                type="text"
                placeholder="Filtrar por destinatario..."
                value={selectedDestinatario}
                onChange={e => setSelectedDestinatario(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid #cbd3dd', width: '100%', fontSize: '0.9rem' }}
              />
            </div>

            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.85rem' }}>Artículo/Código</label>
              <input
                type="text"
                placeholder="Buscar artículo o código..."
                value={searchArticulo}
                onChange={e => setSearchArticulo(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid #cbd3dd', width: '100%', fontSize: '0.9rem' }}
              />
            </div>

            <button 
              className="btn btn-secondary" 
              onClick={limpiarFiltros}
              style={{ padding: '8px 16px', height: 'fit-content' }}
            >
              Limpiar
            </button>

            {salidas.length > 0 && (
              <button
                className="btn btn-success"
                onClick={() => generarReportePDF(getGroupedSalidas(), selectedMonth, selectedYear)}
                style={{ padding: '8px 16px', height: 'fit-content' }}
              >
                Exportar PDF
              </button>
            )}
          </div>
        </div>

        {/* Contador de resultados */}
        <div style={{ marginBottom: 12, fontSize: '0.9rem', color: '#666' }}>
          {loading ? 'Cargando...' : `Mostrando ${salidas.length} salida(s)`}
        </div>

        {/* Tabla simple estilo Excel */}
        {loading ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px', 
            color: '#999',
            background: '#fafafa',
            borderRadius: 4
          }}>
            Cargando salidas...
          </div>
        ) : salidas.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px', 
            color: '#999',
            background: '#fafafa',
            borderRadius: 4
          }}>
            No hay salidas registradas para este período
          </div>
        ) : (
          <div style={{ 
            border: '1px solid #d0d0d0',
            borderRadius: 4,
            overflow: 'hidden'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse', 
                fontSize: '0.9rem',
                fontFamily: 'Arial, sans-serif'
              }}>
                <thead>
                  <tr style={{ background: '#f0f0f0' }}>
                    <th style={{ 
                      textAlign: 'left', 
                      padding: '10px 12px', 
                      fontWeight: 600, 
                      color: '#333',
                      borderRight: '1px solid #d0d0d0',
                      borderBottom: '1px solid #d0d0d0',
                      width: '180px'
                    }}>
                      Destinatario
                    </th>
                    <th style={{ 
                      textAlign: 'left', 
                      padding: '10px 12px', 
                      fontWeight: 600, 
                      color: '#333',
                      borderRight: '1px solid #d0d0d0',
                      borderBottom: '1px solid #d0d0d0'
                    }}>
                      Artículo
                    </th>
                    <th style={{ 
                      textAlign: 'left', 
                      padding: '10px 12px', 
                      fontWeight: 600, 
                      color: '#333',
                      borderRight: '1px solid #d0d0d0',
                      borderBottom: '1px solid #d0d0d0',
                      width: '130px'
                    }}>
                      Código
                    </th>
                    <th style={{ 
                      textAlign: 'right', 
                      padding: '10px 12px', 
                      fontWeight: 600, 
                      color: '#333',
                      borderRight: '1px solid #d0d0d0',
                      borderBottom: '1px solid #d0d0d0',
                      width: '90px'
                    }}>
                      Cantidad
                    </th>
                    <th style={{ 
                      textAlign: 'left', 
                      padding: '10px 12px', 
                      fontWeight: 600, 
                      color: '#333',
                      borderRight: '1px solid #d0d0d0',
                      borderBottom: '1px solid #d0d0d0',
                      width: '150px'
                    }}>
                      Área
                    </th>
                    <th style={{ 
                      textAlign: 'center', 
                      padding: '10px 12px', 
                      fontWeight: 600, 
                      color: '#333',
                      borderBottom: '1px solid #d0d0d0',
                      width: '110px'
                    }}>
                      Fecha
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {salidas.map((salida, idx) => (
                    <tr 
                      key={salida.id}
                      style={{ 
                        background: idx % 2 === 0 ? '#fff' : '#fafafa'
                      }}
                    >
                      <td style={{ 
                        padding: '8px 12px',
                        borderRight: '1px solid #e8e8e8',
                        borderBottom: '1px solid #e8e8e8'
                      }}>
                        {salida.destinatario}
                      </td>
                      <td style={{ 
                        padding: '8px 12px',
                        borderRight: '1px solid #e8e8e8',
                        borderBottom: '1px solid #e8e8e8'
                      }}>
                        {salida.articulo}
                      </td>
                      <td style={{ 
                        padding: '8px 12px',
                        borderRight: '1px solid #e8e8e8',
                        borderBottom: '1px solid #e8e8e8',
                        fontFamily: 'Consolas, monospace',
                        color: '#555'
                      }}>
                        {salida.codigo}
                      </td>
                      <td style={{ 
                        padding: '8px 12px',
                        textAlign: 'right',
                        borderRight: '1px solid #e8e8e8',
                        borderBottom: '1px solid #e8e8e8',
                        fontWeight: 500
                      }}>
                        {salida.cantidad}
                      </td>
                      <td style={{ 
                        padding: '8px 12px',
                        borderRight: '1px solid #e8e8e8',
                        borderBottom: '1px solid #e8e8e8',
                        color: '#555'
                      }}>
                        {salida.area}
                      </td>
                      <td style={{ 
                        padding: '8px 12px',
                        textAlign: 'center',
                        borderBottom: '1px solid #e8e8e8',
                        color: '#555'
                      }}>
                        {formatFecha(salida.fecha)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalidasPage;
