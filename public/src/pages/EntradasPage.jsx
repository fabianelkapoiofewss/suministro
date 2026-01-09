
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config/api';

const EntradasPage = () => {
  const [entradas, setEntradas] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState(null);
  const fileInputRef = useRef();
  const navigate = useNavigate();

  const handleFileUpload = async (e) => {
    e.preventDefault();
    setUploadMsg(null);
    const file = fileInputRef.current.files[0];
    if (!file) return setUploadMsg('Selecciona un archivo primero.');
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      const res = await fetch(`${API_URL}/entradas/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al subir archivo');
      setUploadMsg('Archivo procesado correctamente.');
      // Recargar entradas
      fetch(`${API_URL}/entradas`)
        .then(r => r.json())
        .then(data => {
          const entradasArray = Array.isArray(data) ? data : [];
          setEntradas(entradasArray);
          setFiltered(entradasArray);
        });
    } catch (err) {
      setUploadMsg(err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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

  useEffect(() => {
    if (!search) {
      setFiltered(entradas);
    } else {
      setFiltered(
        entradas.filter(i =>
          i.articulo.toLowerCase().includes(search.toLowerCase()) ||
          i.codigo.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, entradas]);

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
      <h2>Entradas</h2>

      <form onSubmit={handleFileUpload} style={{ margin: '1rem 0' }}>
        <input type="file" accept=".xls,.xlsx, .xlsm" ref={fileInputRef} disabled={uploading} />
        <button type="submit" className="btn btn-outline-primary" disabled={uploading} style={{ marginLeft: 8 }}>
          {uploading ? 'Subiendo...' : 'Subir Excel'}
        </button>
        {uploadMsg && <span style={{ marginLeft: 12, color: uploadMsg.includes('correctamente') ? 'green' : 'red' }}>{uploadMsg}</span>}
      </form>

      <div style={{ margin: '1rem 0' }}>
        <input
          type="text"
          placeholder="Buscar por artículo o código..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: '0.5rem', width: '100%', maxWidth: 300 }}
        />
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 20 }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Artículo</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Código</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Cantidad</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr><td colSpan={4} style={{ textAlign: 'center', padding: 16 }}>No hay resultados</td></tr>
          ) : (
            filtered.map(i => (
              <tr key={i.id}>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{i.articulo}</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{i.codigo}</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{i.cantidad}</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{i.fecha ? i.fecha.slice(0,10) : ''}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EntradasPage;
