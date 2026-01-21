
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config/api';

const EntradasPage = () => {
  const [entradas, setEntradas] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchArticulo, setSearchArticulo] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/entradas`)
      .then(r => r.json())
      .then(data => {
        const entradasArray = Array.isArray(data) ? data : [];
        setEntradas(entradasArray);
        setFiltered(entradasArray);
      })
      .catch(() => {
        setEntradas([]);
        setFiltered([]);
      });
  }, []);

  // Aplicar filtros
  useEffect(() => {
    let result = [...entradas];

    // Filtrar por artículo o código
    if (searchArticulo) {
      result = result.filter(i =>
        i.articulo.toLowerCase().includes(searchArticulo.toLowerCase()) ||
        i.codigo.toLowerCase().includes(searchArticulo.toLowerCase())
      );
    }

    // Filtrar por rango de fechas
    if (fechaDesde) {
      result = result.filter(i => {
        if (!i.fecha) return false;
        const fechaEntrada = i.fecha.slice(0, 10);
        return fechaEntrada >= fechaDesde;
      });
    }

    if (fechaHasta) {
      result = result.filter(i => {
        if (!i.fecha) return false;
        const fechaEntrada = i.fecha.slice(0, 10);
        return fechaEntrada <= fechaHasta;
      });
    }

    setFiltered(result);
  }, [searchArticulo, fechaDesde, fechaHasta, entradas]);

  // Limpiar filtros
  const limpiarFiltros = () => {
    setSearchArticulo('');
    setFechaDesde('');
    setFechaHasta('');
  };

  // Formatear fecha a dd-mm-yyyy
  function formatFecha(fechaStr) {
    if (!fechaStr) return '';
    const [y, m, d] = fechaStr.slice(0,10).split('-');
    return `${d}-${m}-${y}`;
  }

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
          Registro de Entradas
        </h2>

        {/* Filtros simples */}
        <div style={{ 
          display: 'flex', 
          gap: 16, 
          marginBottom: 20, 
          padding: '20px',
          background: '#f8f9fa',
          borderRadius: 6,
          flexWrap: 'wrap',
          alignItems: 'flex-end'
        }}>
          <div style={{ flex: '1 1 300px', minWidth: '250px' }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 600 }}>
              Buscar por Artículo o Código
            </label>
            <input
              type="text"
              placeholder="Escriba para buscar..."
              value={searchArticulo}
              onChange={e => setSearchArticulo(e.target.value)}
              style={{ 
                padding: '8px 12px',
                width: '100%',
                border: '1px solid #cbd3dd',
                borderRadius: 4,
                fontSize: '0.9rem'
              }}
            />
          </div>

          <div style={{ flex: '1 1 180px' }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 600 }}>
              Desde
            </label>
            <input
              type="date"
              value={fechaDesde}
              onChange={e => setFechaDesde(e.target.value)}
              style={{ 
                padding: '8px 12px',
                width: '100%',
                border: '1px solid #cbd3dd',
                borderRadius: 4,
                fontSize: '0.9rem'
              }}
            />
          </div>

          <div style={{ flex: '1 1 180px' }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 600 }}>
              Hasta
            </label>
            <input
              type="date"
              value={fechaHasta}
              onChange={e => setFechaHasta(e.target.value)}
              style={{ 
                padding: '8px 12px',
                width: '100%',
                border: '1px solid #cbd3dd',
                borderRadius: 4,
                fontSize: '0.9rem'
              }}
            />
          </div>

          <button 
            onClick={limpiarFiltros}
            className="btn btn-secondary"
            style={{ padding: '8px 16px', height: 'fit-content' }}
          >
            Limpiar
          </button>
        </div>

        {/* Contador de resultados */}
        <div style={{ marginBottom: 12, fontSize: '0.9rem', color: '#666' }}>
          Mostrando {filtered.length} de {entradas.length} entradas
        </div>

        {/* Tabla estilo Excel */}
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
                    width: '150px'
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
                    width: '120px'
                  }}>
                    Cantidad
                  </th>
                  <th style={{ 
                    textAlign: 'center', 
                    padding: '10px 12px', 
                    fontWeight: 600, 
                    color: '#333',
                    borderBottom: '1px solid #d0d0d0',
                    width: '130px'
                  }}>
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ 
                      textAlign: 'center', 
                      padding: '40px 20px',
                      color: '#999',
                      background: '#fafafa'
                    }}>
                      No hay registros que mostrar
                    </td>
                  </tr>
                ) : (
                  filtered.map((i, idx) => (
                    <tr 
                      key={i.id}
                      style={{ 
                        background: idx % 2 === 0 ? '#fff' : '#fafafa'
                      }}
                    >
                      <td style={{ 
                        padding: '8px 12px',
                        borderRight: '1px solid #e8e8e8',
                        borderBottom: '1px solid #e8e8e8'
                      }}>
                        {i.articulo}
                      </td>
                      <td style={{ 
                        padding: '8px 12px',
                        borderRight: '1px solid #e8e8e8',
                        borderBottom: '1px solid #e8e8e8',
                        fontFamily: 'Consolas, monospace',
                        color: '#555'
                      }}>
                        {i.codigo}
                      </td>
                      <td style={{ 
                        padding: '8px 12px',
                        borderRight: '1px solid #e8e8e8',
                        borderBottom: '1px solid #e8e8e8',
                        textAlign: 'right',
                        fontWeight: 500
                      }}>
                        {i.cantidad}
                      </td>
                      <td style={{ 
                        padding: '8px 12px',
                        borderBottom: '1px solid #e8e8e8',
                        textAlign: 'center',
                        color: '#555'
                      }}>
                        {formatFecha(i.fecha)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntradasPage;
