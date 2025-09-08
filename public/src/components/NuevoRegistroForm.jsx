import React, { useState } from 'react';


const NuevoRegistroForm = ({ onSuccess }) => {
  const [articulo, setArticulo] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [codigo, setCodigo] = useState('');
  // Fecha por defecto: hoy
  const today = new Date().toISOString().slice(0, 10);
  const [fecha, setFecha] = useState(today);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Convertir fecha a formato ISO (YYYY-MM-DDTHH:mm:ss.sssZ)
      const fechaISO = fecha ? new Date(fecha).toISOString() : null;
      const res = await fetch('http://suministros:3434/entradas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articulo, cantidad: Number(cantidad), codigo, fecha: fechaISO })
      });
      if (!res.ok) throw new Error('Error al crear la entrada');
  setArticulo('');
  setCantidad('');
  setCodigo('');
  setFecha(today);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="nuevo-registro-form" onSubmit={handleSubmit} style={{
      display: 'flex', flexDirection: 'column', gap: '1.2rem', marginTop: '1rem', padding: '8px 0'
    }}>
      <input
        type="text"
        placeholder="Artículo"
        value={articulo}
        onChange={e => setArticulo(e.target.value)}
        required
        style={{ padding: '10px', borderRadius: 8, border: '1px solid #ccc', fontSize: '1rem' }}
      />
      <input
        type="number"
        placeholder="Cantidad"
        value={cantidad}
        onChange={e => setCantidad(e.target.value)}
        required
        min="1"
        style={{ padding: '10px', borderRadius: 8, border: '1px solid #ccc', fontSize: '1rem' }}
      />
      <input
        type="text"
        placeholder="Código"
        value={codigo}
        onChange={e => setCodigo(e.target.value)}
        required
        style={{ padding: '10px', borderRadius: 8, border: '1px solid #ccc', fontSize: '1rem' }}
      />
      <input
        type="date"
        placeholder="Fecha"
        value={fecha}
        onChange={e => setFecha(e.target.value)}
        required
        style={{ padding: '10px', borderRadius: 8, border: '1px solid #ccc', fontSize: '1rem' }}
      />
      <button
        className="btn btn-primary"
        type="submit"
        disabled={loading}
        style={{ padding: '12px 0', borderRadius: 8, fontWeight: 600, fontSize: '1.1rem', marginTop: '8px' }}
      >
        {loading ? 'Guardando...' : 'Guardar'}
      </button>
      {error && <div style={{ color: 'red', marginTop: 6 }}>{error}</div>}
    </form>
  );
};

export default NuevoRegistroForm;
