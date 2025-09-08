import React, { useState, useEffect, useRef } from 'react';
import NuevoRegistroForm from '../components/NuevoRegistroForm';
import { useNavigate } from 'react-router-dom';


const InventarioPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState('');
  const [inventario, setInventario] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState(null);
  const fileInputRef = useRef();

  const handleFileUpload = async (e) => {
    e.preventDefault();
    setUploadMsg(null);
    const file = fileInputRef.current.files[0];
    if (!file) return setUploadMsg('Selecciona un archivo primero.');
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      const res = await fetch('http://suministros:3434/inventarios/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al subir archivo');
      setUploadMsg('Archivo procesado correctamente.');
      // Recargar inventario
      fetch('http://suministros:3434/inventarios')
        .then(r => r.json())
        .then(data => {
          setInventario(data);
          setFiltered(data);
        });
    } catch (err) {
      setUploadMsg(err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    fetch('http://suministros:3434/inventarios')
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
          Nuevo Registro
        </button>
        <button className="btn btn-secondary" onClick={() => setShowSearch(v => !v)}>
          {showSearch ? 'Cerrar búsqueda' : 'Buscar'}
        </button>
        <button className="btn btn-warning" onClick={() => navigate('/salidas')}>Salidas</button>
        <button className="btn btn-info" onClick={() => navigate('/entradas')}>Entradas</button>
        <button className="btn btn-success" onClick={() => navigate('/encargados-area')}>
          Encargados de área
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
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 1000 }} onClick={() => setShowForm(false)}>
          <div style={{ background: '#fff', padding: 32, borderRadius: 8, maxWidth: 500, margin: '60px auto', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button style={{ position: 'absolute', top: 12, right: 12 }} onClick={() => setShowForm(false)}>✕</button>
            <NuevoRegistroForm onSuccess={() => {
              setShowForm(false);
              // Recargar inventario después de crear registro
              fetch('http://localhost:3434/inventarios')
                .then(r => r.json())
                .then(data => {
                  setInventario(data);
                  setFiltered(data);
                });
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

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 20 }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Artículo</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Código</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Cantidad</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr><td colSpan={3} style={{ textAlign: 'center', padding: 16 }}>No hay resultados</td></tr>
          ) : (
            filtered.map(i => {
              let color = '';
              if (i.cantidad > 50) color = 'green';
              else if (i.cantidad < 10) color = 'red';
              else color = 'orange';
              return (
                <tr key={i.id}>
                  <td style={{ border: '1px solid #ccc', padding: 8 }}>{i.articulo}</td>
                  <td style={{ border: '1px solid #ccc', padding: 8 }}>{i.codigo}</td>
                  <td style={{ border: '1px solid #ccc', padding: 8, color: color, fontWeight: 'bold' }}>{i.cantidad}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InventarioPage;
