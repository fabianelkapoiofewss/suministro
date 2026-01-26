import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import API_URL from '../config/api';

const API = `${API_URL}/nota-pedido`;

export default function NotaPedidoSemanal() {
  const [articulo, setArticulo] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notaCerrada, setNotaCerrada] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Cargar artículos desde la base de datos
  const cargarItems = async () => {
    try {
      setLoading(true);
      const res = await fetch(API);
      const data = await res.json();
      setItems(data);
    } catch (error) {
      showToast('Error al cargar artículos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarItems();
  }, []);

  async function agregarItem() {
    if (!articulo.trim()) return;
    
    try {
      // Obtener fecha local sin problema de timezone
      const hoy = new Date();
      const fechaLocal = new Date(hoy.getTime() - (hoy.getTimezoneOffset() * 60000))
        .toISOString()
        .split('T')[0];
      
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          articulo: articulo.trim(),
          fecha: fechaLocal
        })
      });

      if (!res.ok) throw new Error('Error al agregar artículo');

      const nuevoItem = await res.json();
      setItems([nuevoItem, ...items]);
      setArticulo("");
      showToast('Artículo agregado exitosamente', 'success');
    } catch (error) {
      showToast('Error al agregar artículo', 'error');
    }
  }

  async function quitarItem(id) {
    try {
      const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar artículo');

      setItems(items.filter(item => item.id !== id));
      showToast('Artículo eliminado', 'success');
    } catch (error) {
      showToast('Error al eliminar artículo', 'error');
    }
  }

  async function limpiarLista() {
    if (!window.confirm('¿Estás seguro de limpiar toda la lista?')) return;
    
    try {
      const res = await fetch(API, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al limpiar lista');

      setItems([]);
      showToast('Lista limpiada exitosamente', 'success');
    } catch (error) {
      showToast('Error al limpiar lista', 'error');
    }
  }

  function cerrarNota() {
    if (items.length === 0) {
      showToast('No hay artículos para cerrar la nota', 'warning');
      return;
    }
    setNotaCerrada(true);
    showToast('Nota cerrada. Ahora puedes descargar el PDF', 'success');
  }

  async function nuevaNota() {
    try {
      const res = await fetch(API, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al crear nueva nota');

      setItems([]);
      setNotaCerrada(false);
      showToast('Nueva nota iniciada', 'success');
    } catch (error) {
      showToast('Error al crear nueva nota', 'error');
    }
  }

  function descargarPDF() {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Nota de Pedido Semanal', 14, 20);
    
    // Fecha de generación
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, 14, 28);

    // Tabla de artículos
    const tableData = items.map((item, idx) => [
      idx + 1,
      item.articulo,
      new Date(item.fecha + 'T00:00:00').toLocaleDateString('es-ES')
    ]);

    autoTable(doc, {
      startY: 35,
      head: [['#', 'Artículo', 'Fecha Agregado']],
      body: tableData,
      theme: 'grid',
      headStyles: { 
        fillColor: [25, 118, 210],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        1: { halign: 'left', cellWidth: 120 },
        2: { halign: 'center', cellWidth: 40 }
      },
      styles: {
        fontSize: 10,
        cellPadding: 4
      }
    });

    // Resumen al final
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total de artículos: ${items.length}`, 14, finalY);

    const hoy = new Date();
    const fechaArchivo = `${hoy.getDate()}-${hoy.getMonth()+1}-${hoy.getFullYear()}`;
    doc.save(`nota-pedido-${fechaArchivo}.pdf`);
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: 20 }}>
      {/* Header */}
      <div style={{ 
        background: '#fff', 
        borderRadius: 12, 
        padding: '20px 32px',
        marginBottom: 20,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              fontSize: '1rem',
              color: '#1976d2',
              fontWeight: 600
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ marginRight: 8 }}>
              <path d="M15 18L9 12L15 6" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Volver
          </button>
          <h2 style={{ margin: 0, color: '#1976d2' }}>📝 Nota de Pedido Semanal</h2>
          {notaCerrada && (
            <span style={{
              marginLeft: 16,
              padding: '6px 16px',
              background: '#4caf50',
              color: '#fff',
              borderRadius: 20,
              fontSize: '0.85rem',
              fontWeight: 600
            }}>
              ✓ Cerrada
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {!notaCerrada ? (
            <>
              {items.length > 0 && (
                <button 
                  className="btn btn-primary" 
                  onClick={cerrarNota}
                >
                  🔒 Cerrar Nota
                </button>
              )}
            </>
          ) : (
            <>
              <button 
                className="btn btn-success" 
                onClick={descargarPDF}
              >
                📥 Descargar PDF
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={nuevaNota}
              >
                📄 Nueva Nota
              </button>
            </>
          )}
        </div>
      </div>

      {/* Contenedor principal */}
      <div style={{ 
        maxWidth: 800, 
        margin: '0 auto',
        background: '#fff',
        borderRadius: 12,
        padding: 32,
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        opacity: notaCerrada ? 0.7 : 1,
        pointerEvents: notaCerrada ? 'none' : 'auto'
      }}>
        {/* Formulario para agregar artículo */}
        {!notaCerrada && (
          <div style={{ 
            background: '#e3f2fd',
            borderRadius: 8,
          padding: 20,
          marginBottom: 24
        }}>
          <h3 style={{ 
            marginTop: 0, 
            marginBottom: 16, 
            color: '#1976d2',
            fontSize: '1.1rem'
          }}>
            ➕ Agregar Artículo Faltante
          </h3>
          <div style={{ display: 'flex', gap: 12 }}>
            <input
              type="text"
              placeholder="Nombre del artículo..."
              value={articulo}
              onChange={e => setArticulo(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && agregarItem()}
              style={{ 
                flex: 1,
                padding: '12px 16px',
                border: '2px solid #1976d2',
                borderRadius: 8,
                fontSize: '1rem',
                outline: 'none'
              }}
            />
            <button 
              className="btn btn-primary" 
              onClick={agregarItem}
              disabled={!articulo.trim()}
              style={{ minWidth: 120 }}
            >
              Agregar
            </button>
          </div>
        </div>
        )}

        {/* Lista de artículos */}
        <div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 16
          }}>
            <h3 style={{ 
              margin: 0, 
              color: '#333',
              fontSize: '1.1rem'
            }}>
              📦 Artículos Faltantes
            </h3>
            <div style={{ 
              background: '#e8f5e9',
              padding: '6px 16px',
              borderRadius: 20,
              fontWeight: 600,
              color: '#2e7d32'
            }}>
              {items.length} artículo{items.length !== 1 ? 's' : ''}
            </div>
          </div>

          {loading ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              color: '#1976d2',
              fontSize: '1rem'
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
              <p>Cargando artículos...</p>
            </div>
          ) : items.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              color: '#999',
              fontSize: '1rem'
            }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>📋</div>
              <p>No hay artículos en la lista</p>
              <p style={{ fontSize: '0.9rem' }}>Agrega los artículos que faltan en el inventario</p>
            </div>
          ) : (
            <div style={{ 
              border: '1px solid #e0e0e0',
              borderRadius: 8,
              overflow: 'hidden'
            }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{ background: '#f8f9fa' }}>
                    <th style={{ 
                      padding: '12px 16px', 
                      textAlign: 'left',
                      fontWeight: 600,
                      color: '#555',
                      width: '50px'
                    }}>
                      #
                    </th>
                    <th style={{ 
                      padding: '12px 16px', 
                      textAlign: 'left',
                      fontWeight: 600,
                      color: '#555'
                    }}>
                      Artículo
                    </th>
                    <th style={{ 
                      padding: '12px 16px', 
                      textAlign: 'center',
                      fontWeight: 600,
                      color: '#555',
                      width: '140px'
                    }}>
                      Fecha Agregado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr 
                      key={item.id}
                      style={{ 
                        borderTop: '1px solid #e0e0e0',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8f9fa'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ 
                        padding: '12px 16px',
                        color: '#666',
                        fontWeight: 500
                      }}>
                        {idx + 1}
                      </td>
                      <td style={{ 
                        padding: '12px 16px',
                        fontWeight: 500,
                        color: '#333'
                      }}>
                        {item.articulo}
                      </td>
                      <td style={{ 
                        padding: '12px 16px',
                        textAlign: 'center',
                        color: '#666',
                        fontSize: '0.9rem'
                      }}>
                        {new Date(item.fecha + 'T00:00:00').toLocaleDateString('es-ES')}
                      </td>
                      <td style={{ 
                        padding: '12px 16px',
                        textAlign: 'center'
                      }}>
                        {!notaCerrada && (
                          <button
                            onClick={() => quitarItem(item.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: 6,
                              borderRadius: 6,
                              transition: 'background 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#ffebee'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            title="Quitar artículo"
                          >
                            <span style={{ fontSize: 20 }}>🗑️</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Información adicional */}
        {items.length > 0 && !notaCerrada && (
          <div style={{ 
            marginTop: 24,
            padding: 16,
            background: '#fff3e0',
            borderRadius: 8,
            fontSize: '0.9rem',
            color: '#f57c00',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <span style={{ fontSize: 24 }}>💡</span>
            <span>
              Cuando completes la lista semanal, cierra la nota para descargar el PDF
            </span>
          </div>
        )}
        
        {notaCerrada && (
          <div style={{ 
            marginTop: 24,
            padding: 16,
            background: '#e8f5e9',
            borderRadius: 8,
            fontSize: '0.9rem',
            color: '#2e7d32',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <span style={{ fontSize: 24 }}>✅</span>
            <span>
              Nota cerrada. Descarga el PDF o inicia una nueva nota semanal
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
