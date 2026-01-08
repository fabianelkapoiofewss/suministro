import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NuevaSalida from './NuevaSalida';
import { generarReportePDF } from '../components/reportes';
import { useToast } from '../context/ToastContext.jsx';

const SalidasPage = () => {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  // Formatear fecha a dd-mm-yyyy
  function formatFecha(fechaStr) {
    if (!fechaStr) return '';
    const [y, m, d] = fechaStr.slice(0,10).split('-');
    return `${d}-${m}-${y}`;
  }
  const [salidas, setSalidas] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch('http://localhost:3434/salidas')
      .then(r => r.json())
      .then(data => {
        // Ordenar por fecha descendente
        const sorted = [...data].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        setSalidas(sorted);
      })
      .catch(() => setSalidas([]));
  }, [showForm]); // Refresca al cerrar el formulario

  // Filtrar y agrupar salidas por mes y destinatario
  const getGroupedSalidas = () => {
    if (!selectedMonth || !selectedYear) return {};
    // Filtrar por mes/año
    const filtered = salidas.filter(s => {
      if (!s.fecha) return false;
      const date = new Date(s.fecha);
      return date.getMonth() + 1 === Number(selectedMonth) && date.getFullYear() === Number(selectedYear);
    });
    // Agrupar por área y luego por destinatario
    const grupos = {};
    filtered.forEach(s => {
      const destinatario = s.destinatario || 'Sin destinatario';
      
      if (!grupos[area]) grupos[area] = {};
      if (!grupos[area][destinatario]) grupos[area][destinatario] = [];
      
      grupos[area][destinatario].push(s);
    });
    return grupos;
  };

  // Función para obtener salidas agrupadas solo por destinatario (para vista)
  const getGroupedSalidasPorDestinatario = () => {
    if (!selectedMonth || !selectedYear) return {};
    const filtered = salidas.filter(s => {
      if (!s.fecha) return false;
      const date = new Date(s.fecha);
      return date.getMonth() + 1 === Number(selectedMonth) && date.getFullYear() === Number(selectedYear);
    });
    const grupos = {};
    filtered.forEach(s => {
      const destinatario = s.destinatario || 'Sin destinatario';
      if (!grupos[destinatario]) grupos[destinatario] = [];
      grupos[destinatario].push(s);
    });
    return grupos;
  };
  return (
    <div className="page" style={{ position: 'relative' }}>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Salidas</h2>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>Registrar nueva salida</button>
          <button className="btn btn-outline btn-sm" onClick={() => generarReportePDF(getGroupedSalidas(), selectedMonth, selectedYear)}>Exportar PDF</button>
        </div>
      </div>

      {/* Selector de mes y año */}
      <div style={{ margin: '24px 0', display: 'flex', gap: 16, alignItems: 'center' }}>
        <label>Mes:</label>
        <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
          <option value="">--</option>
          {[...Array(12)].map((_, i) => (
            <option key={i+1} value={i+1}>{String(i+1).padStart(2,'0')}</option>
          ))}
        </select>
        <label>Año:</label>
        <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
          <option value="">--</option>
          {Array.from(new Set(salidas.map(s => s.fecha ? new Date(s.fecha).getFullYear() : null).filter(Boolean))).map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Agrupado por destinatario */}
      {/* Agrupado por destinatario */}
      {selectedMonth && selectedYear ? (
        <div style={{ marginTop: 24 }}>
          {(() => {
            const grupos = getGroupedSalidasPorDestinatario();
            const destKeys = Object.keys(grupos);
            if (destKeys.length === 0) return <div>No hay salidas para ese mes.</div>;
            return destKeys.map(destinatario => (
              <div key={destinatario} style={{
                marginBottom: 40,
                border: '1px solid #e0e0e0',
                borderRadius: 10,
                background: '#f8f9fa',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                padding: '24px 32px'
              }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1976d2', marginBottom: 12, letterSpacing: 1 }}>{destinatario}</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '1rem', background: 'transparent' }}>
                  <thead>
                    <tr style={{ background: '#f0f4f8' }}>
                      <th style={{ textAlign: 'left', padding: '6px 12px', fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>Fecha</th>
                      <th style={{ textAlign: 'left', padding: '6px 12px', fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>Artículo</th>
                      <th style={{ textAlign: 'right', padding: '6px 12px', fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>Cantidad</th>
                      <th style={{ textAlign: 'left', padding: '6px 12px', fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>Área</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grupos[destinatario].map(salida => (
                      <tr key={salida.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '6px 12px', color: '#222' }}>{salida.fecha ? formatFecha(salida.fecha) : ''}</td>
                        <td style={{ padding: '6px 12px', color: '#222' }}>{salida.articulo}</td>
                        <td style={{ padding: '6px 12px', textAlign: 'right', color: '#1976d2', fontWeight: 500 }}>{salida.cantidad}</td>
                        <td style={{ padding: '6px 12px', color: '#444' }}>{salida.area}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1976d2', marginBottom: 12, letterSpacing: 1 }}>{destinatario}</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '1rem', background: 'transparent' }}>
                  <thead>
                    <tr style={{ background: '#f0f4f8' }}>
                      <th style={{ textAlign: 'left', padding: '6px 12px', fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>Fecha</th>
                      <th style={{ textAlign: 'left', padding: '6px 12px', fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>Artículo</th>
                      <th style={{ textAlign: 'right', padding: '6px 12px', fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>Cantidad</th>
                      <th style={{ textAlign: 'left', padding: '6px 12px', fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>Área</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grupos[destinatario].map(salida => (
                      <tr key={salida.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '6px 12px', color: '#222' }}>{salida.fecha ? formatFecha(salida.fecha) : ''}</td>
                        <td style={{ padding: '6px 12px', color: '#222' }}>{salida.articulo}</td>
                        <td style={{ padding: '6px 12px', textAlign: 'right', color: '#1976d2', fontWeight: 500 }}>{salida.cantidad}</td>
                        <td style={{ padding: '6px 12px', color: '#444' }}>{salida.area}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ));
          })()}
        </div>
      ) : (
        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '90%', maxWidth: 1200, background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '32px 40px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '1rem' }}>
              <thead>
                <tr style={{ background: '#f0f4f8' }}>
                  <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 700, borderBottom: '2px solid #e0e0e0' }}>Fecha</th>
                  <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 700, borderBottom: '2px solid #e0e0e0' }}>Artículo</th>
                  <th style={{ textAlign: 'right', padding: '10px 16px', fontWeight: 700, borderBottom: '2px solid #e0e0e0' }}>Cantidad</th>
                  <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 700, borderBottom: '2px solid #e0e0e0' }}>Área</th>
                  <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 700, borderBottom: '2px solid #e0e0e0' }}>Destinatario</th>
                </tr>
              </thead>
              <tbody>
                {salidas.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '24px 0' }}>No hay salidas registradas.</td></tr>
                ) : (
                  salidas.map(salida => (
                    <tr key={salida.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '8px 16px', color: '#222' }}>{salida.fecha ? formatFecha(salida.fecha) : ''}</td>
                      <td style={{ padding: '8px 16px', color: '#222' }}>{salida.articulo}</td>
                      <td style={{ padding: '8px 16px', textAlign: 'right', color: '#1976d2', fontWeight: 500 }}>{salida.cantidad}</td>
                      <td style={{ padding: '8px 16px', color: '#444' }}>{salida.area}</td>
                      <td style={{ padding: '8px 16px', color: '#444' }}>{salida.destinatario}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal para registrar nueva salida */}
      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 1000 }} onClick={() => setShowForm(false)}>
          <div style={{ background: '#fff', padding: 32, borderRadius: 8, maxWidth: 500, margin: '60px auto', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button style={{ position: 'absolute', top: 12, right: 12 }} onClick={() => setShowForm(false)}>✕</button>
            <NuevaSalida />
          </div>
        </div>
      )}
    </div>
  );
};

export default SalidasPage;