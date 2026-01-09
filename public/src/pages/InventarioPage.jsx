import React, { useState, useEffect, useRef } from 'react';
import NuevoRegistroForm from '../components/NuevoRegistroForm';
import EditarRegistroForm from '../components/EditarRegistroForm';
import { useNavigate } from 'react-router-dom';
import { useInventario } from '../hooks/useInventario.js';
import { useToast } from '../context/ToastContext.jsx';


const InventarioPage = () => {
  const [search, setSearch] = useState('');
  const { inventario, loading, error, refresh, uploadExcel } = useInventario();
  const [filtered, setFiltered] = useState([]);
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState(null);
  const fileInputRef = useRef();
  const [editRegistro, setEditRegistro] = useState(null);
  const { showToast } = useToast();

  const handleFileUpload = async (e) => {
    e.preventDefault();
    setUploadMsg(null);
    const file = fileInputRef.current.files[0];
    if (!file) return setUploadMsg('Selecciona un archivo primero.');
    setUploading(true);
    try {
      await uploadExcel(file);
      setUploadMsg('Archivo procesado correctamente.');
      showToast('Archivo procesado correctamente.', 'success');
    } catch (err) {
      setUploadMsg(err.message);
      showToast(err.message, 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    if (!search) {
      setFiltered(inventario);
    } else {
      setFiltered(
        inventario.filter(i =>
          i.articulo.toLowerCase().includes(search.toLowerCase()) ||
          i.codigo.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, inventario]);

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f5f5f5',
      padding: '20px'
    }}>
      {/* Header con título y botones de navegación */}
      <div style={{ 
        background: '#fff', 
        borderRadius: 12, 
        padding: '20px 32px',
        marginBottom: 20,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <h2 style={{ margin: 0, color: '#1976d2' }}>Inventario</h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn btn-warning" onClick={() => navigate('/salidas')}>
              Salidas
            </button>
            <button className="btn btn-info" onClick={() => navigate('/entradas')}>
              Entradas
            </button>
            <button className="btn btn-success" onClick={() => navigate('/encargados-area')}>
              Encargados
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/nota-pedido-semanal')}>
              Nota Pedido
            </button>
          </div>
        </div>
      </div>

      {/* Layout de dos columnas */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '400px 1fr',
        gap: 20,
        alignItems: 'start'
      }}>
        {/* COLUMNA IZQUIERDA - Formulario de Nueva Entrada */}
        <div style={{ 
          background: '#fff', 
          borderRadius: 12, 
          padding: '24px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          position: 'sticky',
          top: 20
        }}>
          <h3 style={{ 
            marginTop: 0, 
            marginBottom: 20, 
            color: '#1976d2',
            fontSize: '1.2rem',
            borderBottom: '2px solid #e0e0e0',
            paddingBottom: 12
          }}>
            ➕ Nueva Entrada
          </h3>
          <NuevoRegistroForm onSuccess={() => {
            refresh();
            showToast('Entrada registrada correctamente', 'success');
          }} />

          {/* Formulario para subir Excel */}
          <div style={{ 
            marginTop: 32, 
            paddingTop: 24, 
            borderTop: '1px solid #e0e0e0' 
          }}>
            <h4 style={{ 
              marginTop: 0, 
              marginBottom: 16, 
              fontSize: '1rem',
              color: '#555'
            }}>
              📄 Importar desde Excel
            </h4>
            <form onSubmit={handleFileUpload}>
              <input 
                type="file" 
                accept=".xls,.xlsx,.xlsm" 
                ref={fileInputRef} 
                disabled={uploading}
                style={{ 
                  width: '100%',
                  marginBottom: 12,
                  padding: 8,
                  border: '1px solid #ccc',
                  borderRadius: 6,
                  fontSize: '0.9rem'
                }}
              />
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={uploading}
                style={{ width: '100%' }}
              >
                {uploading ? '⏳ Subiendo...' : '📤 Subir Excel'}
              </button>
              {uploadMsg && (
                <div style={{ 
                  marginTop: 12, 
                  padding: '8px 12px',
                  borderRadius: 6,
                  fontSize: '0.85rem',
                  background: uploadMsg.includes('correctamente') ? '#e8f5e9' : '#ffebee',
                  color: uploadMsg.includes('correctamente') ? '#2e7d32' : '#c62828'
                }}>
                  {uploadMsg}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* COLUMNA DERECHA - Inventario */}
        <div style={{ 
          background: '#fff', 
          borderRadius: 12, 
          padding: '24px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
        }}>
          {/* Buscador */}
          <div style={{ marginBottom: 20 }}>
            <input
              type="text"
              placeholder="🔍 Buscar por artículo o código..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ 
                padding: '12px 16px', 
                width: '95%',
                border: '2px solid #e0e0e0',
                borderRadius: 8,
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#1976d2'}
              onBlur={e => e.target.style.borderColor = '#e0e0e0'}
            />
            {search && (
              <div style={{ 
                marginTop: 8, 
                fontSize: '0.9rem', 
                color: '#666' 
              }}>
                {filtered.length} resultado(s) encontrado(s)
              </div>
            )}
          </div>

          {/* Tabla de inventario */}
          <div style={{ 
            maxHeight: 'calc(100vh - 240px)', 
            overflowY: 'auto', 
            border: '1px solid #e0e0e0', 
            borderRadius: 8 
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ position: 'sticky', top: 0, background: '#f0f4f8', border: '1px solid #e0e0e0', padding: '12px 8px', width: '30%', zIndex: 2, fontWeight: 600 }}>Artículo</th>
                  <th style={{ position: 'sticky', top: 0, background: '#f0f4f8', border: '1px solid #e0e0e0', padding: '12px 8px', width: '15%', zIndex: 2, fontWeight: 600 }}>Código</th>
                  <th style={{ position: 'sticky', top: 0, background: '#f0f4f8', border: '1px solid #e0e0e0', padding: '12px 8px', width: '12%', zIndex: 2, fontWeight: 600, textAlign: 'center' }}>Entrada</th>
                  <th style={{ position: 'sticky', top: 0, background: '#f0f4f8', border: '1px solid #e0e0e0', padding: '12px 8px', width: '12%', zIndex: 2, fontWeight: 600, textAlign: 'center' }}>Salida</th>
                  <th style={{ position: 'sticky', top: 0, background: '#f0f4f8', border: '1px solid #e0e0e0', padding: '12px 8px', width: '15%', zIndex: 2, fontWeight: 600, textAlign: 'center' }}>Stock Actual</th>
                  <th style={{ position: 'sticky', top: 0, background: '#f0f4f8', border: '1px solid #e0e0e0', padding: '12px 8px', width: '8%', zIndex: 2, fontWeight: 600, textAlign: 'center' }}>Editar</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: '#999' }}>⏳ Cargando inventario...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: '#999' }}>
                    {search ? '❌ No hay resultados para tu búsqueda' : '📦 No hay artículos en el inventario'}
                  </td></tr>
                ) : (
                  filtered.map(i => {
                    const entrada = i.entrada || 0;
                    const salida = i.salida || 0;
                    const cantidadActual = i.cantidad || 0;
                    let color = '';
                    let bgColor = '';
                    if (cantidadActual > 50) {
                      color = '#2e7d32';
                      bgColor = '#e8f5e9';
                    } else if (cantidadActual < 10) {
                      color = '#c62828';
                      bgColor = '#ffebee';
                    } else {
                      color = '#f57c00';
                      bgColor = '#fff3e0';
                    }
                    return (
                      <tr key={i.id} style={{ 
                        borderBottom: '1px solid #e0e0e0',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8f9fa'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ border: '1px solid #e2e2e2', padding: '10px 8px' }}>{i.articulo}</td>
                        <td style={{ border: '1px solid #e2e2e2', padding: '10px 8px', fontSize: '0.9rem', color: '#666' }}>{i.codigo}</td>
                        <td style={{ border: '1px solid #e2e2e2', padding: '10px 8px', textAlign: 'center', color: '#1976d2', fontWeight: 500 }}>{entrada}</td>
                        <td style={{ border: '1px solid #e2e2e2', padding: '10px 8px', textAlign: 'center', color: '#666', fontWeight: 500 }}>{salida}</td>
                        <td style={{ 
                          border: '1px solid #e2e2e2', 
                          padding: '10px 8px', 
                          textAlign: 'center',
                          color: color, 
                          fontWeight: 'bold',
                          background: bgColor,
                          fontSize: '1.05rem'
                        }}>
                          {cantidadActual}
                        </td>
                        <td style={{ border: '1px solid #e2e2e2', padding: '10px 8px', textAlign: 'center' }}>
                          <button
                            title="Editar registro"
                            style={{ 
                              background: 'none', 
                              border: 'none', 
                              cursor: 'pointer', 
                              padding: 4,
                              borderRadius: 4,
                              transition: 'background 0.2s'
                            }}
                            onClick={() => setEditRegistro(i)}
                            onMouseEnter={e => e.currentTarget.style.background = '#e3f2fd'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <span role="img" aria-label="editar" style={{ fontSize: 20 }}>✏️</span>
                          </button>
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

      {/* Modal para editar registro */}
      {editRegistro && (
        <div className="modal-overlay" onClick={() => setEditRegistro(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setEditRegistro(null)}>✕</button>
            <EditarRegistroForm
              registro={editRegistro}
              onSuccess={() => {
                refresh();
                setEditRegistro(null);
                showToast('Registro actualizado correctamente', 'success');
              }}
              onCancel={() => setEditRegistro(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default InventarioPage;
