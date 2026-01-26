import React, { useState } from 'react';
import { useToast } from '../context/ToastContext.jsx';
import API_URL from '../config/api';

const EditarRegistroForm = ({ registro, onSuccess, onCancel }) => {
  const [articulo, setArticulo] = useState(registro.articulo);
  const [cantidad, setCantidad] = useState(registro.cantidad);
  const [codigo, setCodigo] = useState(registro.codigo);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/inventarios/${registro.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articulo, cantidad: Number(cantidad), codigo })
      });
  if (!res.ok) { let data=null; try{ data=await res.json(); }catch{}; throw new Error(data?.error || 'Error al editar el registro'); }
      if (onSuccess) onSuccess();
  showToast('Registro actualizado','success');
    } catch (err) {
      setError(err.message);
  showToast(err.message,'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="editar-registro-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
      <input
        type="text"
        placeholder="Artículo"
        value={articulo}
        onChange={e => setArticulo(e.target.value)}
        required
      />
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
      <div className="btn-row" style={{ marginTop: 4 }}>
        <button className="btn btn-primary btn-block" type="submit" disabled={loading} style={{ flex: 1 }}>
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
        <button className="btn btn-outline btn-block" type="button" onClick={onCancel} style={{ flex: 1 }}>
          Cancelar
        </button>
      </div>
      {error && <div style={{ color: 'red', marginTop: 6 }}>{error}</div>}
    </form>
  );
};

export default EditarRegistroForm;
