import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config/api';
import { useToast } from '../context/ToastContext.jsx';

const EntradasPage = () => {
  const [entradas, setEntradas] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchArticulo, setSearchArticulo] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [editandoEntrada, setEditandoEntrada] = useState(null);
  const [formEditEntrada, setFormEditEntrada] = useState({});
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [entradaAEliminar, setEntradaAEliminar] = useState(null);

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

  // Recargar entradas
  const recargarEntradas = () => {
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
  };

  // Eliminar entrada
  const eliminarEntrada = async (id) => {
    try {
      const res = await fetch(`${API_URL}/entradas/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Error al eliminar entrada');
      showToast('✓ Entrada eliminada correctamente. Stock restado del inventario.', 'success');
      setMostrarModalEliminar(false);
      setEntradaAEliminar(null);
      recargarEntradas();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Mostrar modal de confirmación
  const confirmarEliminar = (entrada) => {
    setEntradaAEliminar(entrada);
    setMostrarModalEliminar(true);
  };

  // Cancelar eliminación
  const cancelarEliminar = () => {
    setMostrarModalEliminar(false);
    setEntradaAEliminar(null);
  };

  // Iniciar edición
  const iniciarEdicion = (entrada) => {
    setEditandoEntrada(entrada.id);
    setFormEditEntrada({
      articulo: entrada.articulo,
      codigo: entrada.codigo,
      cantidad: entrada.cantidad,
      fecha: entrada.fecha ? entrada.fecha.slice(0, 10) : ''
    });
  };

  // Cancelar edición
  const cancelarEdicion = () => {
    setEditandoEntrada(null);
    setFormEditEntrada({});
  };

  // Guardar edición
  const guardarEdicion = async (id) => {
    try {
      const res = await fetch(`${API_URL}/entradas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formEditEntrada)
      });
      if (!res.ok) throw new Error('Error al actualizar entrada');
      showToast('✓ Entrada actualizada correctamente', 'success');
      setEditandoEntrada(null);
      setFormEditEntrada({});
      recargarEntradas();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Formatear fecha a dd-mm-yyyy
  function formatFecha(fechaStr) {
    if (!fechaStr) return '';
    const [y, m, d] = fechaStr.slice(0,10).split('-');
    return `${d}-${m}-${y}`;
  }

  return (
    <div className="page">
      {/* Modal de confirmación de eliminación */}
      {mostrarModalEliminar && entradaAEliminar && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: '32px',
            maxWidth: 450,
            width: '90%',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ 
              fontSize: '3rem', 
              textAlign: 'center', 
              marginBottom: 16,
              color: '#ff9800'
            }}>
              ⚠️
            </div>
            <h3 style={{ 
              margin: '0 0 16px 0', 
              textAlign: 'center',
              color: '#333',
              fontSize: '1.3rem'
            }}>
              ¿Eliminar esta entrada?
            </h3>
            <div style={{
              background: '#f5f5f5',
              padding: '16px',
              borderRadius: 8,
              marginBottom: 20,
              fontSize: '0.9rem'
            }}>
              <p style={{ margin: '0 0 8px 0' }}>
                <strong>Artículo:</strong> {entradaAEliminar.articulo}
              </p>
              <p style={{ margin: '0 0 8px 0' }}>
                <strong>Cantidad:</strong> {entradaAEliminar.cantidad}
              </p>
              <p style={{ margin: '0 0 8px 0' }}>
                <strong>Código:</strong> {entradaAEliminar.codigo}
              </p>
              <p style={{ margin: 0, color: '#ff9800', fontWeight: 600, marginTop: 12 }}>
                💡 La cantidad se restará del inventario
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={cancelarEliminar}
                style={{
                  padding: '10px 24px',
                  background: '#e0e0e0',
                  color: '#333',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.95rem'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => eliminarEntrada(entradaAEliminar.id)}
                style={{
                  padding: '10px 24px',
                  background: '#f44336',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.95rem'
                }}
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

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
                    borderRight: '1px solid #d0d0d0',
                    borderBottom: '1px solid #d0d0d0',
                    width: '130px'
                  }}>
                    Fecha
                  </th>
                  <th style={{ 
                    textAlign: 'center', 
                    padding: '10px 12px', 
                    fontWeight: 600, 
                    color: '#333',
                    borderRight: '1px solid #d0d0d0',
                    borderBottom: '1px solid #d0d0d0',
                    width: '80px'
                  }}>
                    Editar
                  </th>
                  <th style={{ 
                    textAlign: 'center', 
                    padding: '10px 12px', 
                    fontWeight: 600, 
                    color: '#333',
                    borderBottom: '1px solid #d0d0d0',
                    width: '80px'
                  }}>
                    Eliminar
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ 
                      textAlign: 'center', 
                      padding: '40px 20px',
                      color: '#999',
                      background: '#fafafa'
                    }}>
                      No hay registros que mostrar
                    </td>
                  </tr>
                ) : (
                  filtered.map((i, idx) => {
                    const editando = editandoEntrada === i.id;

                    return (
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
                          {editando ? (
                            <input
                              type="text"
                              value={formEditEntrada.articulo}
                              onChange={e => setFormEditEntrada({...formEditEntrada, articulo: e.target.value})}
                              style={{ width: '95%', padding: '4px', border: '1px solid #ccc', borderRadius: 4 }}
                            />
                          ) : i.articulo}
                        </td>
                        <td style={{ 
                          padding: '8px 12px',
                          borderRight: '1px solid #e8e8e8',
                          borderBottom: '1px solid #e8e8e8',
                          fontFamily: 'Consolas, monospace',
                          color: '#555'
                        }}>
                          {editando ? (
                            <input
                              type="text"
                              value={formEditEntrada.codigo}
                              onChange={e => setFormEditEntrada({...formEditEntrada, codigo: e.target.value})}
                              style={{ width: '95%', padding: '4px', border: '1px solid #ccc', borderRadius: 4 }}
                            />
                          ) : i.codigo}
                        </td>
                        <td style={{ 
                          padding: '8px 12px',
                          borderRight: '1px solid #e8e8e8',
                          borderBottom: '1px solid #e8e8e8',
                          textAlign: 'right',
                          fontWeight: 500
                        }}>
                          {editando ? (
                            <input
                              type="number"
                              value={formEditEntrada.cantidad}
                              onChange={e => setFormEditEntrada({...formEditEntrada, cantidad: parseInt(e.target.value) || 0})}
                              style={{ width: '70%', padding: '4px', border: '1px solid #ccc', borderRadius: 4, textAlign: 'right' }}
                            />
                          ) : i.cantidad}
                        </td>
                        <td style={{ 
                          padding: '8px 12px',
                          borderRight: '1px solid #e8e8e8',
                          borderBottom: '1px solid #e8e8e8',
                          textAlign: 'center',
                          color: '#555'
                        }}>
                          {editando ? (
                            <input
                              type="date"
                              value={formEditEntrada.fecha}
                              onChange={e => setFormEditEntrada({...formEditEntrada, fecha: e.target.value})}
                              style={{ width: '95%', padding: '4px', border: '1px solid #ccc', borderRadius: 4 }}
                            />
                          ) : formatFecha(i.fecha)}
                        </td>
                        <td style={{ 
                          padding: '8px 12px',
                          borderRight: '1px solid #e8e8e8',
                          borderBottom: '1px solid #e8e8e8',
                          textAlign: 'center'
                        }}>
                          {editando ? (
                            <button
                              onClick={() => guardarEdicion(i.id)}
                              style={{
                                padding: '4px 8px',
                                background: '#4caf50',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 4,
                                cursor: 'pointer',
                                fontSize: '0.75rem'
                              }}
                              title="Guardar"
                            >
                              ✓
                            </button>
                          ) : (
                            <button
                              onClick={() => iniciarEdicion(i)}
                              style={{
                                padding: '4px 8px',
                                background: '#2196f3',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 4,
                                cursor: 'pointer',
                                fontSize: '0.75rem'
                              }}
                              title="Editar"
                            >
                              ✎
                            </button>
                          )}
                        </td>
                        <td style={{ 
                          padding: '8px 12px',
                          borderBottom: '1px solid #e8e8e8',
                          textAlign: 'center'
                        }}>
                          {editando ? (
                            <button
                              onClick={cancelarEdicion}
                              style={{
                                padding: '4px 8px',
                                background: '#9e9e9e',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 4,
                                cursor: 'pointer',
                                fontSize: '0.75rem'
                              }}
                              title="Cancelar"
                            >
                              ✕
                            </button>
                          ) : (
                            <button
                              onClick={() => confirmarEliminar(i)}
                              style={{
                                padding: '4px 8px',
                                background: '#f44336',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 4,
                                cursor: 'pointer',
                                fontSize: '0.75rem'
                              }}
                              title="Eliminar"
                            >
                              🗑
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
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
