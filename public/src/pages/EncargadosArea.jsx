import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CrearArea from '../components/CrearArea';

const API = 'http://suministros:3434/encargados';

const EncargadosArea = () => {
  const navigate = useNavigate();
  const [filteredAreas, setFilteredAreas] = useState([]);
  const [encargados, setEncargados] = useState([]);
  const [areas, setAreas] = useState([]);
  const [nombre, setNombre] = useState('');
  const [areaIds, setAreaIds] = useState([]);
  const [selectedEncargado, setSelectedEncargado] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [areasDeEncargado, setAreasDeEncargado] = useState([]);
  const [encargadosDeArea, setEncargadosDeArea] = useState([]);
  const [error, setError] = useState(null);

  // Cargar encargados y áreas
  const fetchEncargados = () => {
    fetch(API)
      .then(r => r.json())
      .then(setEncargados)
      .catch(() => setEncargados([]));
  };
  const fetchAreas = () => {
    fetch('http://suministros:3434/areas')
      .then(r => r.json())
      .then(setAreas)
      .catch(() => setAreas([]));
  };
  useEffect(() => {
    fetchEncargados();
    fetchAreas();
  setFilteredAreas([]);
  }, []);

  // Actualizar filteredAreas cuando cambian las áreas
  useEffect(() => {
    setFilteredAreas(areas);
  }, [areas]);
  // Crear encargado y asignar áreas
  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, areaIds })
      });
      if (!res.ok) throw new Error('Error al crear encargado');
      setNombre('');
      setAreaIds([]);
      const data = await res.json();
      setEncargados(encargados => [...encargados, data]);
    } catch (err) {
      setError(err.message);
    }
  };

  // Consultar áreas de un encargado
  const handleSelectEncargado = async (id) => {
    setSelectedEncargado(id);
    setSelectedArea(null);
    setError(null);
    try {
      const res = await fetch(`${API}/encargado/${id}`);
      if (!res.ok) throw new Error('Error al consultar áreas');
      setAreasDeEncargado(await res.json());
    } catch (err) {
      setAreasDeEncargado([]);
      setError(err.message);
    }
  };

  // Consultar encargados de un área
  const handleSelectArea = async (id) => {
    setSelectedArea(id);
    setSelectedEncargado(null);
    setError(null);
    try {
      const res = await fetch(`${API}/area/${id}`);
      if (!res.ok) throw new Error('Error al consultar encargados');
      setEncargadosDeArea(await res.json());
    } catch (err) {
      setEncargadosDeArea([]);
      setError(err.message);
    }
  };

  // Asignar encargado a áreas
  const handleAssign = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const encargadoId = selectedEncargado;
      const res = await fetch(`${API}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ encargadoId, areaIds })
      });
      if (!res.ok) throw new Error('Error al asignar áreas');
      setAreaIds([]);
      handleSelectEncargado(encargadoId);
    } catch (err) {
      setError(err.message);
    }
  };

  // Quitar encargado de un área
  const handleRemove = async (encargadoId, areaId) => {
    setError(null);
    try {
      const res = await fetch(`${API}/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ encargadoId, areaId })
      });
      if (!res.ok) throw new Error('Error al quitar encargado del área');
      handleSelectEncargado(encargadoId);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 1300, margin: '0 auto', padding: '32px 0' }}>
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
      <h2 style={{ fontWeight: 700, fontSize: '2rem', marginBottom: 24 }}>Encargados de Área</h2>
      {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '32px', alignItems: 'flex-start' }}>
        {/* Crear y asignar */}
        <div style={{ background: '#f8f9fa', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: '24px 32px', minHeight: 340 }}>
          <h3 style={{ fontWeight: 600, fontSize: '1.2rem', marginBottom: 16 }}>Crear encargado y asignar áreas</h3>
          <CrearArea onCreate={fetchAreas} />
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem', alignItems: 'flex-start', width: '100%' }}>
            <input type="text" placeholder="Nombre encargado" value={nombre} onChange={e => setNombre(e.target.value)} required style={{ padding: '10px', borderRadius: 8, border: '1px solid #ccc', fontSize: '1rem', width: '100%' }} />
            {/* Selector multichoice con scroll y búsqueda */}
            <div style={{ width: '100%' }}>
              <input type="text" placeholder="Buscar área..." style={{ padding: '8px', borderRadius: 6, border: '1px solid #ccc', fontSize: '1rem', width: '100%', marginBottom: 6 }}
                onChange={e => {
                  const val = e.target.value.toLowerCase();
                  setFilteredAreas(areas.filter(a => a.nombre.toLowerCase().includes(val)));
                }}
              />
              <div style={{ maxHeight: 120, overflowY: 'auto', border: '1px solid #ccc', borderRadius: 6, background: '#fff', padding: '4px' }}>
                {(filteredAreas || areas).map(a => (
                  <label key={a.id} style={{ display: 'block', padding: '4px 0', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={areaIds.includes(a.id)}
                      onChange={e => {
                        if (e.target.checked) setAreaIds([...areaIds, a.id]);
                        else setAreaIds(areaIds.filter(id => id !== a.id));
                      }}
                      style={{ marginRight: 8 }}
                    />
                    {a.nombre}
                  </label>
                ))}
              </div>
            </div>
            {/* Visualización de áreas seleccionadas */}
            {areaIds.length > 0 && (
              <div style={{ margin: '8px 0', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {areaIds.map(id => {
                  const area = areas.find(a => a.id === id);
                  return area ? <span key={id} style={{ padding: '4px 12px', borderRadius: 6, background: '#e3f2fd', color: '#1976d2', fontWeight: 500 }}>{area.nombre}</span> : null;
                })}
              </div>
            )}
            <button className="btn btn-primary" type="submit" style={{ padding: '10px 24px', borderRadius: 8, fontWeight: 600, alignSelf: 'flex-end' }}>Crear y asignar</button>
          </form>
        </div>
        {/* Encargados */}
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: '24px 32px', minHeight: 340 }}>
          <h3 style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: 16 }}>Encargados</h3>
          <ul style={{ listStyle: 'none', padding: 0, maxHeight: 400, overflowY: 'auto' }}>
            {encargados.length === 0 ? (
              <li style={{color: '#888'}}>No hay encargados registrados.</li>
            ) : (
              encargados.map(e => (
                <li key={e.id} style={{ marginBottom: 10 }}>
                  <button onClick={() => handleSelectEncargado(e.id)} style={{ padding: '6px 16px', borderRadius: 6, border: '1px solid #1976d2', background: selectedEncargado === e.id ? '#1976d2' : '#f0f4f8', color: selectedEncargado === e.id ? '#fff' : '#1976d2', fontWeight: 500, cursor: 'pointer', fontSize: '1rem', width: '100%', textAlign: 'left' }}>{e.nombre}</button>
                </li>
              ))
            )}
          </ul>
          {selectedEncargado && (
            <div style={{ marginTop: 18 }}>
              <h4 style={{ fontWeight: 600, fontSize: '1rem', marginBottom: 10 }}>Áreas de este encargado</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {areasDeEncargado.map(a => (
                  <li key={a.id} style={{ marginBottom: 8, display: 'flex', alignItems: 'center' }}>
                    <span style={{ padding: '4px 12px', borderRadius: 6, background: '#e3f2fd', color: '#1976d2', fontWeight: 500 }}>{a.nombre}</span>
                    <button onClick={() => handleRemove(selectedEncargado, a.id)} style={{ marginLeft: 12, padding: '4px 10px', borderRadius: 6, border: 'none', background: '#e57373', color: '#fff', fontWeight: 500, cursor: 'pointer' }}>Quitar</button>
                  </li>
                ))}
              </ul>
              <form onSubmit={handleAssign} style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start', width: '100%' }}>
                <label style={{ fontWeight: 500 }}>Asignar a áreas:</label>
                <div style={{ width: '100%' }}>
                  <input type="text" placeholder="Buscar área..." style={{ padding: '8px', borderRadius: 6, border: '1px solid #ccc', fontSize: '1rem', width: '100%', marginBottom: 6 }}
                    onChange={e => {
                      const val = e.target.value.toLowerCase();
                      setFilteredAreas(areas.filter(a => a.nombre.toLowerCase().includes(val)));
                    }}
                  />
                  <div style={{ maxHeight: 120, overflowY: 'auto', border: '1px solid #ccc', borderRadius: 6, background: '#fff', padding: '4px' }}>
                    {(filteredAreas || areas).map(a => (
                      <label key={a.id} style={{ display: 'block', padding: '4px 0', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={areaIds.includes(a.id)}
                          onChange={e => {
                            if (e.target.checked) setAreaIds([...areaIds, a.id]);
                            else setAreaIds(areaIds.filter(id => id !== a.id));
                          }}
                          style={{ marginRight: 8 }}
                        />
                        {a.nombre}
                      </label>
                    ))}
                  </div>
                </div>
                {areaIds.length > 0 && (
                  <div style={{ margin: '8px 0', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {areaIds.map(id => {
                      const area = areas.find(a => a.id === id);
                      return area ? <span key={id} style={{ padding: '4px 12px', borderRadius: 6, background: '#e3f2fd', color: '#1976d2', fontWeight: 500 }}>{area.nombre}</span> : null;
                    })}
                  </div>
                )}
                <button className="btn btn-secondary" type="submit" style={{ padding: '10px 24px', borderRadius: 8, fontWeight: 600, alignSelf: 'flex-end' }}>Asignar</button>
              </form>
            </div>
          )}
        </div>
        {/* Áreas */}
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: '24px 32px', minHeight: 340 }}>
          <h3 style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: 16 }}>Áreas</h3>
          <ul style={{ listStyle: 'none', padding: 0, maxHeight: 400, overflowY: 'auto' }}>
            {areas.length === 0 ? (
              <li style={{color: '#888'}}>No hay áreas registradas.</li>
            ) : (
              areas.map(a => (
                <li key={a.id} style={{ marginBottom: 10 }}>
                  <button onClick={() => handleSelectArea(a.id)} style={{ padding: '6px 16px', borderRadius: 6, border: '1px solid #388e3c', background: selectedArea === a.id ? '#388e3c' : '#f0f4f8', color: selectedArea === a.id ? '#fff' : '#388e3c', fontWeight: 500, cursor: 'pointer', fontSize: '1rem', width: '100%', textAlign: 'left' }}>{a.nombre}</button>
                </li>
              ))
            )}
          </ul>
          {selectedArea && (
            <div style={{ marginTop: 18 }}>
              <h4 style={{ fontWeight: 600, fontSize: '1rem', marginBottom: 10 }}>Encargados de esta área</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {encargadosDeArea.map(e => (
                  <li key={e.id} style={{ marginBottom: 8 }}>
                    <span style={{ padding: '4px 12px', borderRadius: 6, background: '#e8f5e9', color: '#388e3c', fontWeight: 500 }}>{e.nombre}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EncargadosArea;
