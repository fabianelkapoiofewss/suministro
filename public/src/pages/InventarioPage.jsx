import React, { useState, useEffect, useRef } from 'react';
import NuevoRegistroForm from '../components/NuevoRegistroForm';
import EditarRegistroForm from '../components/EditarRegistroForm';
import { useNavigate } from 'react-router-dom';
import { useInventario } from '../hooks/useInventario.js';
import { useToast } from '../context/ToastContext.jsx';


const InventarioPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
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
      const res = await fetch('http://localhost:3434/inventarios/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al subir archivo');
      setUploadMsg('Archivo procesado correctamente.');
      // Recargar inventario
      fetch('http://localhost:3434/inventarios')
        .then(r => r.json())
        .then(data => {
          setInventario(data);
          setFiltered(data);
        });
    } catch (err) {
      setUploadMsg(err.message);
      showToast(err.message, 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    fetch('http://localhost:3434/inventarios')
      .then(r => r.json())
      .then(data => {
        setInventario(data);
        setFiltered(data);
      })
      .catch(() => {
        setInventario([]);
        setFiltered([]);
      });
  }, []);

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
    <div className="page">
      <h2>Inventario</h2>
      <div className="main-buttons" style={{ display: 'flex', gap: '1rem', margin: '2rem 0' }}>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          Nueva Entrada
        </button>
        <button className="btn btn-secondary" onClick={() => setShowSearch(v => !v)}>
          {showSearch ? 'Cerrar Inventario' : 'Inventario'}
        </button>
        <button className="btn btn-warning salida" onClick={() => navigate('/salidas')}>Salidas</button>
        <button className="btn btn-info entradas" onClick={() => navigate('/entradas')}>Entradas</button>
        <button className="btn btn-success" onClick={() => navigate('/encargados-area')}>
          Encargados de área
        </button>
        <button className="btn btn-secondary" onClick={() => navigate('/nota-pedido-semanal')}>
          Nota de Pedido Semanal
        </button>
      </div>

      {/* Formulario para subir Excel */}
      <form onSubmit={handleFileUpload} style={{ margin: '1rem 0' }}>
        <input type="file" accept=".xls,.xlsx, .xlsm" ref={fileInputRef} disabled={uploading} />
        <button type="submit" className="btn btn-outline-primary" disabled={uploading} style={{ marginLeft: 8 }}>
          {uploading ? 'Subiendo...' : 'Subir Excel'}
        </button>
        {uploadMsg && <span style={{ marginLeft: 12, color: uploadMsg.includes('correctamente') ? 'green' : 'red' }}>{uploadMsg}</span>}
      </form>

      {/* Modal para el formulario de nuevo registro */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            <NuevoRegistroForm onSuccess={() => {
              setShowForm(false);
              refresh();
            }} />
          </div>
        </div>
      )}

      {showSearch && (
        <div style={{ margin: '1rem 0' }}>
          <input
            type="text"
            placeholder="Buscar por artículo o código..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: '0.5rem', width: '100%', maxWidth: 300 }}
          />
        </div>
      )}

      <div style={{ maxHeight: 500, overflowY: 'auto', marginTop: 20, border: '1px solid #ccc', borderRadius: 4 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th style={{ position: 'sticky', top: 0, background: '#f7f7f7', border: '1px solid #ccc', padding: 8, width: '30%', zIndex: 2 }}>Artículo</th>
              <th style={{ position: 'sticky', top: 0, background: '#f7f7f7', border: '1px solid #ccc', padding: 8, width: '15%', zIndex: 2 }}>Código</th>
              <th style={{ position: 'sticky', top: 0, background: '#f7f7f7', border: '1px solid #ccc', padding: 8, width: '15%', zIndex: 2 }}>Entrada</th>
              <th style={{ position: 'sticky', top: 0, background: '#f7f7f7', border: '1px solid #ccc', padding: 8, width: '15%', zIndex: 2 }}>Salida</th>
              <th style={{ position: 'sticky', top: 0, background: '#f7f7f7', border: '1px solid #ccc', padding: 8, width: '15%', zIndex: 2 }}>Cantidad actual</th>
              <th style={{ position: 'sticky', top: 0, background: '#f7f7f7', border: '1px solid #ccc', padding: 8, width: '10%', zIndex: 2 }}>Editar</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 16 }}>No hay resultados</td></tr>
            ) : (
              filtered.map(i => {
                const entrada = i.entrada || 0;
                const salida = i.salida || 0;
                const cantidadActual = i.cantidad || 0;
                let color = '';
                if (cantidadActual > 50) color = 'green';
                else if (cantidadActual < 10) color = 'red';
                else color = 'orange';
                return (
                  <tr key={i.id}>
                    <td style={{ border: '1px solid #e2e2e2', padding: 8, width: '30%' }}>{i.articulo}</td>
                    <td style={{ border: '1px solid #e2e2e2', padding: 8, width: '15%' }}>{i.codigo}</td>
                    <td style={{ border: '1px solid #e2e2e2', padding: 8, width: '15%' }}>{entrada}</td>
                    <td style={{ border: '1px solid #e2e2e2', padding: 8, width: '15%' }}>{salida}</td>
                    <td style={{ border: '1px solid #e2e2e2', padding: 8, color: color, fontWeight: 'bold', width: '15%' }}>{cantidadActual}</td>
                    <td style={{ border: '1px solid #e2e2e2', padding: 8, width: '10%' }}>
                      <button
                        title="Editar"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        onClick={() => setEditRegistro(i)}
                      >
                        <span role="img" aria-label="editar" style={{ fontSize: 22 }}>✏️</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
        {/* Modal para editar registro */}
        {editRegistro && (
          <div className="modal-overlay" onClick={() => setEditRegistro(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setEditRegistro(null)}>✕</button>
              {/* Formulario de edición */}
              <EditarRegistroForm
                registro={editRegistro}
                onSuccess={() => {
                fetch('http://localhost:3434/inventarios')
                    .then(r => r.json())
                    .then(data => {
                      setInventario(data);
                      setFiltered(data);
                    });
                  setEditRegistro(null);
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
