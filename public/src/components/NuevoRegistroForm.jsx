import React, { useState } from 'react';
import API_URL from '../config/api';
import { useToast } from '../context/ToastContext.jsx';
import ProductoAutocomplete from './ProductoAutocomplete.jsx';


const NuevoRegistroForm = ({ onSuccess }) => {
  const [articulo, setArticulo] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [codigo, setCodigo] = useState('');
  // Fecha por defecto: hoy
  const today = new Date().toISOString().slice(0, 10);
  const [fecha, setFecha] = useState(today);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  const handleProductoChange = (product) => {
    if (product) {
      setArticulo(product.articulo || '');
      // Si el producto viene de la BD, autocompletar el código
      if (product.codigo) {
        setCodigo(product.codigo);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Convertir fecha a formato ISO (YYYY-MM-DDTHH:mm:ss.sssZ)
      const fechaISO = fecha ? new Date(fecha).toISOString() : null;
      const res = await fetch(`${API_URL}/entradas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articulo, cantidad: Number(cantidad), codigo, fecha: fechaISO })
      });
      if (!res.ok) { let data=null; try { data=await res.json(); } catch {}; throw new Error(data?.error || 'Error al crear la entrada'); }
      
      // Limpiar formulario
      setArticulo('');
      setCantidad('');
      setCodigo('');
      setFecha(today);
      
      if (onSuccess) onSuccess();
      showToast('✓ Entrada registrada. Haz clic en "Actualizar" para ver los cambios.', 'success');
    } catch (err) {
      setError(err.message);
  showToast(err.message,'error');
    } finally {
      setLoading(false);
    }
  };

  return (
  <form className="nuevo-registro-form" onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1rem', marginTop:'.5rem' }}>
      <div>
        <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '0.9rem' }}>Artículo *</label>
        <ProductoAutocomplete
          value={articulo}
          onChange={handleProductoChange}
          required
          validateExists={false}
          placeholder="Buscar o escribir artículo..."
          showStock={false}
        />
      </div>
      <input
        type="number"
        placeholder="Cantidad"
        value={cantidad}
        onChange={e => setCantidad(e.target.value)}
        required
        min="1"
      />
      <input
        type="text"
        placeholder="Código"
        value={codigo}
        onChange={e => setCodigo(e.target.value)}
        required
      />
      <input
        type="date"
        placeholder="Fecha"
        value={fecha}
        onChange={e => setFecha(e.target.value)}
        required
      />
      <button
    className="btn btn-primary btn-block"
        type="submit"
        disabled={loading}
      >
        {loading ? 'Guardando...' : 'Guardar'}
      </button>
      {error && <div style={{ color: 'red', marginTop: 6 }}>{error}</div>}
    </form>
  );
};

export default NuevoRegistroForm;
