import React, { useEffect, useState, useRef } from 'react';
import { useToast } from '../context/ToastContext.jsx';

const API = 'http://localhost:3434';

const NuevaSalida = () => {
  const [inventario, setInventario] = useState([]);
  const [areas, setAreas] = useState([]);
  const [encargados, setEncargados] = useState([]);
  const [areaId, setAreaId] = useState('');
  const [encargadoId, setEncargadoId] = useState('');
  const [productoId, setProductoId] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [filteredEncargados, setFilteredEncargados] = useState([]);
  const [filteredAreas, setFilteredAreas] = useState([]);
  const [producto, setProducto] = useState(null);
  const [fecha, setFecha] = useState(() => formatLocalDate());
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState(null);
  const fileInputRef = useRef();
  const { showToast } = useToast();

  const handleFileUpload = async (e) => {
    e.preventDefault();
    setUploadMsg(null);
    const file = fileInputRef.current.files[0];
    if (!file) return setUploadMsg('Selecciona un archivo primero.');
  const formData = new FormData();
  formData.append('file', file);
    setUploading(true);
    try {
      const res = await fetch('http://localhost:3434/salidas/upload', {
        method: 'POST',
        body: formData
      });
  let data=null; try { data=await res.json(); } catch {}
  if (!res.ok) throw new Error(data?.error || 'Error al subir archivo');
  setUploadMsg('Archivo procesado correctamente.');
  showToast('Salidas importadas','success');
    } catch (err) {
      setUploadMsg(err.message);
  showToast(err.message,'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Cargar inventario, áreas y encargados
  useEffect(() => {
    (async () => {
      try {
        const r1 = await fetch(`${API}/inventarios`); let d1=null; try { d1=await r1.json(); } catch {};
        if (!r1.ok) throw new Error(d1?.error || 'Error inventario');
        setInventario(Array.isArray(d1)? d1: []);
        const r2 = await fetch(`${API}/areas`); let d2=null; try { d2=await r2.json(); } catch {};
        if (!r2.ok) throw new Error(d2?.error || 'Error áreas');
        setAreas(Array.isArray(d2)? d2: []);
        const r3 = await fetch(`${API}/encargados`); let d3=null; try { d3=await r3.json(); } catch {};
        if (!r3.ok) throw new Error(d3?.error || 'Error encargados');
        setEncargados(Array.isArray(d3)? d3: []);
      } catch (e) {
        showToast(e.message,'error');
      }
    })();
  }, []);


  // Filtrar encargados por área seleccionada
  useEffect(() => {
    if (areaId) {
      (async () => {
        try { const r = await fetch(`${API}/encargados/area/${areaId}`); let d=null; try { d=await r.json(); } catch {}; if(!r.ok) throw new Error(d?.error || 'Error encargados área'); setFilteredEncargados(Array.isArray(d)? d: []); }
        catch(e){ setFilteredEncargados([]); showToast(e.message,'error'); }
      })();
    } else {
      setFilteredEncargados([]);
    }
  }, [areaId]);

  // Filtrar áreas por encargado seleccionado
  useEffect(() => {
    if (encargadoId) {
      (async () => {
        try { const r = await fetch(`${API}/encargados/encargado/${encargadoId}`); let d=null; try { d=await r.json(); } catch {}; if(!r.ok) throw new Error(d?.error || 'Error áreas encargado'); setFilteredAreas(Array.isArray(d)? d: []);} catch(e){ setFilteredAreas([]); showToast(e.message,'error'); }
      })();
    } else {
      setFilteredAreas([]);
    }
  }, [encargadoId]);

  // Si selecciono área, filtra encargados; si selecciono encargado, filtra áreas
  // Permite seleccionar ambos en cualquier orden
  const getAreaOptions = () => {
    if (encargadoId && filteredAreas.length > 0) {
      return filteredAreas;
    }
    return areas;
  };

  const getEncargadoOptions = () => {
    if (areaId && filteredEncargados.length > 0) {
      return filteredEncargados;
    }
    return encargados;
  };

  // Guardar producto seleccionado
  useEffect(() => {
    if (productoId) {
      const prod = inventario.find(i => String(i.id) === String(productoId));
      setProducto(prod);
    } else {
      setProducto(null);
    }
  }, [productoId, inventario]);

  // Filtrar áreas según producto seleccionado
  const filteredAreasByProducto = producto
    ? areas.filter(a => {
        // Si el producto tiene un área asociada, filtrar por esa área
        // Suponiendo que el producto tiene un campo areaId o similar
        // Si no, mostrar todas
        return !producto.areaId || producto.areaId === a.id;
      })
    : areas;

  // Filtrar encargados según área seleccionada y producto
  const filteredEncargadosByProducto = () => {
    if (areaId) {
      // Si hay área seleccionada, usar los encargados de esa área y filtrar por producto si aplica
      return filteredEncargados.filter(e => {
        // Aquí podrías filtrar por producto si tienes esa relación
        return true;
      });
    } else if (producto && producto.areaId) {
      // Si hay producto con área asociada, filtrar encargados de esa área
      return encargados.filter(e =>
        filteredEncargados.some(fe => fe.id === e.id)
      );
    } else {
      return encargados;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`${API}/salidas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articulo: producto ? producto.articulo : '',
          cantidad: Number(cantidad),
          area: areaId ? areas.find(a => a.id === Number(areaId)).nombre : '',
          destinatario: encargadoId ? encargados.find(e => e.id === Number(encargadoId)).nombre : '',
          fecha: fecha ? fecha : new Date().toISOString().slice(0, 10),
          codigo: producto ? producto.codigo : ''
        })
      });
  if (!res.ok) { let data=null; try { data=await res.json(); } catch {}; throw new Error(data?.error || 'Error al registrar la salida'); }
      setProductoId('');
      setCantidad('');
      setAreaId('');
      setEncargadoId('');
  setFecha(new Date().toISOString().slice(0, 10));
      setSuccess('Salida registrada correctamente');
  showToast('Salida registrada','success');
    } catch (err) {
      setError(err.message);
  showToast(err.message,'error');
    }
  };

  return (
    <div className="page">
      <h2>Nueva Salida</h2>
  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 400 }}>
        <label>Producto</label>
        <select value={productoId} onChange={e => setProductoId(e.target.value)} required>
          <option value="">Selecciona un producto</option>
          {inventario.map(i => (
            <option key={i.id} value={i.id}>{i.articulo} (Stock: {i.cantidad})</option>
          ))}
        </select>
        <label>Cantidad</label>
        <input type="number" min="1" value={cantidad} onChange={e => setCantidad(e.target.value)} required />
        <label>Fecha de salida</label>
        <input
          type="date"
          value={fecha}
          onChange={e => setFecha(e.target.value)}
          required
        />

        <label>Área</label>
        <select value={areaId} onChange={e => setAreaId(e.target.value)}>
          <option value="">Selecciona un área</option>
          {getAreaOptions().map(a => (
            <option key={a.id} value={a.id}>{a.nombre}</option>
          ))}
        </select>
        <label>Encargado</label>
        <select value={encargadoId} onChange={e => setEncargadoId(e.target.value)}>
          <option value="">Selecciona un encargado</option>
          {getEncargadoOptions().map(e => (
            <option key={e.id} value={e.id}>{e.nombre}</option>
          ))}
        </select>
        {encargadoId && filteredAreas.length > 0 && (
          <div style={{ fontSize: '0.9em', color: '#555' }}>
            Áreas de este encargado: {filteredAreas.map(a => a.nombre).join(', ')}
          </div>
        )}
  <button className="btn btn-primary btn-block" type="submit">Registrar salida</button>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {success && <div style={{ color: 'green' }}>{success}</div>}
      </form>

      {/* Formulario para subir Excel de salidas */}
      <form onSubmit={handleFileUpload} style={{ marginTop: '2rem' }}>
        <input type="file" accept=".xls,.xlsx,.xlsm" ref={fileInputRef} disabled={uploading} />
        <button type="submit" className="btn btn-outline-primary" disabled={uploading} style={{ marginLeft: 8 }}>
          {uploading ? 'Subiendo...' : 'Subir Excel de salidas'}
        </button>
        {uploadMsg && <span style={{ marginLeft: 12, color: uploadMsg.includes('correctamente') ? 'green' : 'red' }}>{uploadMsg}</span>}
      </form>
    </div>
  );
};

export default NuevaSalida;