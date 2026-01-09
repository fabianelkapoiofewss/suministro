import React, { useEffect, useState } from 'react';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:3434/encargados';

const EncargadosArea = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [encargados, setEncargados] = useState([]);
  const [areas, setAreas] = useState([]);
  const [filteredAreas, setFilteredAreas] = useState([]);
  const [searchArea, setSearchArea] = useState('');
  const [searchEncargado, setSearchEncargado] = useState('');
  
  // Estados para formularios
  const [showCrearEncargado, setShowCrearEncargado] = useState(false);
  const [showCrearArea, setShowCrearArea] = useState(false);
  const [nombreEncargado, setNombreEncargado] = useState('');
  const [nombreArea, setNombreArea] = useState('');
  const [selectedAreasForEncargado, setSelectedAreasForEncargado] = useState([]);
  
  // Estado para gestión
  const [selectedEncargado, setSelectedEncargado] = useState(null);
  const [areasDelEncargado, setAreasDelEncargado] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar datos iniciales
  const fetchEncargados = async () => {
    try {
      const res = await fetch(API);
      const data = await res.json();
      setEncargados(data);
    } catch (err) {
      showToast('Error al cargar encargados', 'error');
    }
  };

  const fetchAreas = async () => {
    try {
      const res = await fetch('http://localhost:3434/areas');
      const data = await res.json();
      setAreas(data);
      setFilteredAreas(data);
    } catch (err) {
      showToast('Error al cargar áreas', 'error');
    }
  };

  useEffect(() => {
    fetchEncargados();
    fetchAreas();
  }, []);

  useEffect(() => {
    if (!searchArea) {
      setFilteredAreas(areas);
    } else {
      setFilteredAreas(
        areas.filter(area =>
          area.nombre.toLowerCase().includes(searchArea.toLowerCase())
        )
      );
    }
  }, [searchArea, areas]);

  const filteredEncargados = encargados.filter(enc =>
    enc.nombre.toLowerCase().includes(searchEncargado.toLowerCase())
  );

  // Filtrar áreas por búsqueda
  useEffect(() => {
    if (searchArea) {
      setFilteredAreas(areas.filter(a => 
        a.nombre.toLowerCase().includes(searchArea.toLowerCase())
      ));
    } else {
      setFilteredAreas(areas);
    }
  }, [searchArea, areas]);

  // Crear nuevo encargado
  const handleCrearEncargado = async (e) => {
    e.preventDefault();
    if (!nombreEncargado.trim()) {
      showToast('El nombre del encargado es requerido', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nombre: nombreEncargado, 
          areaIds: selectedAreasForEncargado 
        })
      });
      
      if (!res.ok) throw new Error('Error al crear encargado');
      
      await fetchEncargados();
      setNombreEncargado('');
      setSelectedAreasForEncargado([]);
      setShowCrearEncargado(false);
      showToast('Encargado creado exitosamente', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Crear nueva área
  const handleCrearArea = async (e) => {
    e.preventDefault();
    if (!nombreArea.trim()) {
      showToast('El nombre del área es requerido', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3434/areas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombreArea })
      });
      
      if (!res.ok) throw new Error('Error al crear área');
      
      await fetchAreas();
      setNombreArea('');
      setShowCrearArea(false);
      showToast('Área creada exitosamente', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Seleccionar encargado para gestionar
  const handleSelectEncargado = async (encargado) => {
    setSelectedEncargado(encargado);
    setLoading(true);
    try {
      const res = await fetch(`${API}/encargado/${encargado.id}`);
      if (!res.ok) throw new Error('Error al cargar áreas del encargado');
      const data = await res.json();
      setAreasDelEncargado(data);
    } catch (err) {
      showToast(err.message, 'error');
      setAreasDelEncargado([]);
    } finally {
      setLoading(false);
    }
  };

  // Asignar área a encargado
  const handleAsignarArea = async (areaId) => {
    if (!selectedEncargado) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${API}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          encargadoId: selectedEncargado.id, 
          areaIds: [areaId] 
        })
      });
      
      if (!res.ok) throw new Error('Error al asignar área');
      
      await handleSelectEncargado(selectedEncargado);
      showToast('Área asignada exitosamente', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Quitar área de encargado
  const handleQuitarArea = async (areaId) => {
    if (!selectedEncargado) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${API}/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          encargadoId: selectedEncargado.id, 
          areaId 
        })
      });
      
      if (!res.ok) throw new Error('Error al quitar área');
      
      await handleSelectEncargado(selectedEncargado);
      showToast('Área removida exitosamente', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar encargado
  const handleEliminarEncargado = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este encargado?')) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${API}/encargado/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar encargado');
      
      await fetchEncargados();
      if (selectedEncargado?.id === id) {
        setSelectedEncargado(null);
        setAreasDelEncargado([]);
      }
      showToast('Encargado eliminado exitosamente', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

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
          <h2 style={{ margin: 0, color: '#1976d2' }}>👥 Gestión de Encargados y Áreas</h2>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            className="btn btn-primary" 
            onClick={() => setShowCrearEncargado(true)}
          >
            ➕ Nuevo Encargado
          </button>
          <button 
            className="btn btn-success" 
            onClick={() => setShowCrearArea(true)}
          >
            ➕ Nueva Área
          </button>
        </div>
      </div>

      {/* Layout de dos columnas */}
      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 20, alignItems: 'start' }}>
        {/* COLUMNA IZQUIERDA - Lista de Encargados */}
        <div style={{ 
          background: '#fff', 
          borderRadius: 12, 
          padding: 24,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          position: 'sticky',
          top: 20
        }}>
          <h3 style={{ 
            marginTop: 0, 
            marginBottom: 16, 
            fontSize: '1.2rem',
            color: '#333',
            borderBottom: '2px solid #e0e0e0',
            paddingBottom: 12
          }}>
            📋 Encargados ({encargados.length})
          </h3>
          
          {/* Mini buscador de encargados */}
          <div style={{ marginBottom: 16, position: 'relative' }}>
            <input
              type="text"
              placeholder="🔍 Buscar encargado..."
              value={searchEncargado}
              onChange={e => setSearchEncargado(e.target.value)}
              style={{
                width: '85%',
                padding: '10px 36px 10px 12px',
                border: '2px solid #e0e0e0',
                borderRadius: 8,
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'all 0.2s',
                boxShadow: searchEncargado ? '0 2px 8px rgba(25,118,210,0.1)' : 'none'
              }}
              onFocus={e => e.target.style.borderColor = '#1976d2'}
              onBlur={e => e.target.style.borderColor = '#e0e0e0'}
            />
            {searchEncargado && (
              <button
                onClick={() => setSearchEncargado('')}
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: '#e0e0e0',
                  border: 'none',
                  borderRadius: '50%',
                  width: 24,
                  height: 24,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  color: '#666',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#1976d2'}
                onMouseLeave={e => e.currentTarget.style.background = '#e0e0e0'}
                title="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>
          
          {encargados.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 20px', 
              color: '#999',
              fontSize: '0.95rem'
            }}>
              👤 No hay encargados registrados
            </div>
          ) : filteredEncargados.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '20px', 
              color: '#f57c00',
              fontSize: '0.9rem',
              background: '#fff3e0',
              borderRadius: 8
            }}>
              ⚠️ No se encontraron encargados
            </div>
          ) : (
            <div style={{ maxHeight: 'calc(100vh - 380px)', overflowY: 'auto' }}>
              {filteredEncargados.map(enc => (
                <div 
                  key={enc.id}
                  onClick={() => handleSelectEncargado(enc)}
                  style={{
                    padding: '12px 16px',
                    marginBottom: 8,
                    borderRadius: 8,
                    border: selectedEncargado?.id === enc.id ? '2px solid #1976d2' : '1px solid #e0e0e0',
                    background: selectedEncargado?.id === enc.id ? '#e3f2fd' : '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => {
                    if (selectedEncargado?.id !== enc.id) {
                      e.currentTarget.style.background = '#f8f9fa';
                    }
                  }}
                  onMouseLeave={e => {
                    if (selectedEncargado?.id !== enc.id) {
                      e.currentTarget.style.background = '#fff';
                    }
                  }}
                >
                  <span style={{ 
                    fontWeight: selectedEncargado?.id === enc.id ? 600 : 500,
                    color: selectedEncargado?.id === enc.id ? '#1976d2' : '#333',
                    fontSize: '1rem'
                  }}>
                    {enc.nombre}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEliminarEncargado(enc.id);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 4,
                      borderRadius: 4,
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#ffebee'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    title="Eliminar encargado"
                  >
                    <span style={{ fontSize: 18 }}>🗑️</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA - Gestión de Áreas del Encargado */}
        <div style={{ 
          background: '#fff', 
          borderRadius: 12, 
          padding: 24,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          minHeight: 600
        }}>
          {!selectedEncargado ? (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center',
              height: 500,
              color: '#999',
              fontSize: '1.1rem'
            }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>👈</div>
              <p>Selecciona un encargado para gestionar sus áreas</p>
            </div>
          ) : (
            <>
              <div style={{ 
                background: '#e3f2fd', 
                padding: '16px 20px', 
                borderRadius: 8,
                marginBottom: 24,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: 4 }}>
                    Gestionando:
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1976d2' }}>
                    {selectedEncargado.nombre}
                  </div>
                </div>
                <div style={{ fontSize: '2rem' }}>👤</div>
              </div>

              {/* Áreas asignadas */}
              <div style={{ marginBottom: 32 }}>
                <h4 style={{ 
                  fontSize: '1.1rem', 
                  marginBottom: 16,
                  color: '#333',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  ✅ Áreas Asignadas ({areasDelEncargado.length})
                </h4>
                
                {loading ? (
                  <div style={{ textAlign: 'center', padding: 20, color: '#999' }}>
                    ⏳ Cargando...
                  </div>
                ) : areasDelEncargado.length === 0 ? (
                  <div style={{ 
                    padding: '20px', 
                    background: '#fff3e0', 
                    borderRadius: 8,
                    color: '#f57c00',
                    textAlign: 'center'
                  }}>
                    ⚠️ Este encargado no tiene áreas asignadas
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                    {areasDelEncargado.map(area => (
                      <div
                        key={area.id}
                        style={{
                          padding: '10px 16px',
                          background: '#e8f5e9',
                          borderRadius: 8,
                          border: '1px solid #81c784',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12
                        }}
                      >
                        <span style={{ fontWeight: 500, color: '#2e7d32' }}>
                          {area.nombre}
                        </span>
                        <button
                          onClick={() => handleQuitarArea(area.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 4,
                            borderRadius: 4,
                            fontSize: 16,
                            lineHeight: 1,
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#ffcdd2'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          title="Quitar área"
                        >
                          ✖️
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Asignar nuevas áreas */}
              <div>
                <h4 style={{ 
                  fontSize: '1.1rem', 
                  marginBottom: 16,
                  color: '#333',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  ➕ Asignar Nuevas Áreas
                </h4>

                <input
                  type="text"
                  placeholder="🔍 Buscar área..."
                  value={searchArea}
                  onChange={e => setSearchArea(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e0e0e0',
                    borderRadius: 8,
                    fontSize: '1rem',
                    marginBottom: 16,
                    outline: 'none'
                  }}
                  onFocus={e => e.target.style.borderColor = '#1976d2'}
                  onBlur={e => e.target.style.borderColor = '#e0e0e0'}
                />

                <div style={{ 
                  maxHeight: 300, 
                  overflowY: 'auto',
                  border: '1px solid #e0e0e0',
                  borderRadius: 8,
                  padding: 12
                }}>
                  {filteredAreas.filter(a => 
                    !areasDelEncargado.some(ad => ad.id === a.id)
                  ).length === 0 ? (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: 20, 
                      color: '#999' 
                    }}>
                      {searchArea ? '❌ No se encontraron áreas' : '✅ Todas las áreas están asignadas'}
                    </div>
                  ) : (
                    filteredAreas
                      .filter(a => !areasDelEncargado.some(ad => ad.id === a.id))
                      .map(area => (
                        <div
                          key={area.id}
                          onClick={() => handleAsignarArea(area.id)}
                          style={{
                            padding: '10px 16px',
                            marginBottom: 8,
                            borderRadius: 8,
                            border: '1px solid #e0e0e0',
                            background: '#fff',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = '#e3f2fd';
                            e.currentTarget.style.borderColor = '#1976d2';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = '#fff';
                            e.currentTarget.style.borderColor = '#e0e0e0';
                          }}
                        >
                          <span style={{ fontWeight: 500 }}>{area.nombre}</span>
                          <span>➕</span>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal Crear Encargado */}
      {showCrearEncargado && (
        <div 
          className="modal-overlay" 
          onClick={() => setShowCrearEncargado(false)}
        >
          <div 
            className="modal" 
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: 500 }}
          >
            <button 
              className="modal-close" 
              onClick={() => setShowCrearEncargado(false)}
            >
              ✕
            </button>
            <h3 style={{ marginTop: 0, marginBottom: 24, color: '#1976d2' }}>
              ➕ Nuevo Encargado
            </h3>
            <form onSubmit={handleCrearEncargado}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: 8, 
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}>
                  Nombre del Encargado
                </label>
                <input
                  type="text"
                  value={nombreEncargado}
                  onChange={e => setNombreEncargado(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ccc',
                    borderRadius: 6,
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: 8, 
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}>
                  Asignar Áreas (opcional)
                </label>
                <div style={{ 
                  maxHeight: 200, 
                  overflowY: 'auto',
                  border: '1px solid #ccc',
                  borderRadius: 6,
                  padding: 8
                }}>
                  {areas.map(area => (
                    <label 
                      key={area.id}
                      style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        padding: '8px',
                        cursor: 'pointer',
                        borderRadius: 4
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8f9fa'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <input
                        type="checkbox"
                        checked={selectedAreasForEncargado.includes(area.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedAreasForEncargado([...selectedAreasForEncargado, area.id]);
                          } else {
                            setSelectedAreasForEncargado(
                              selectedAreasForEncargado.filter(id => id !== area.id)
                            );
                          }
                        }}
                        style={{ marginRight: 10 }}
                      />
                      {area.nombre}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowCrearEncargado(false)}
                  className="btn btn-outline"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? '⏳ Creando...' : 'Crear Encargado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Crear Área */}
      {showCrearArea && (
        <div 
          className="modal-overlay" 
          onClick={() => setShowCrearArea(false)}
        >
          <div 
            className="modal" 
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: 400 }}
          >
            <button 
              className="modal-close" 
              onClick={() => setShowCrearArea(false)}
            >
              ✕
            </button>
            <h3 style={{ marginTop: 0, marginBottom: 24, color: '#2e7d32' }}>
              ➕ Nueva Área
            </h3>
            <form onSubmit={handleCrearArea}>
              <div style={{ marginBottom: 24 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: 8, 
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}>
                  Nombre del Área
                </label>
                <input
                  type="text"
                  value={nombreArea}
                  onChange={e => setNombreArea(e.target.value)}
                  placeholder="Ej: Almacén, Producción..."
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ccc',
                    borderRadius: 6,
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowCrearArea(false)}
                  className="btn btn-outline"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={loading}
                >
                  {loading ? '⏳ Creando...' : 'Crear Área'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EncargadosArea;
