import React, { useState, useEffect, useRef } from 'react';
import API_URL from '../config/api';

const EncargadoAutocomplete = ({ 
  value, 
  onChange, 
  required = false,
  areaId = null,
  placeholder = "Buscar o escribir encargado..."
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [allEncargados, setAllEncargados] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);

  // Sincronizar con el value externo (para resetear cuando se limpia desde fuera)
  useEffect(() => {
    if (value === '' || value === null || value === undefined) {
      setSearchTerm('');
      setSuggestions([]);
    } else if (value && value !== searchTerm) {
      setSearchTerm(value);
    }
  }, [value]);

  // Cerrar sugerencias al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cargar todos los encargados
  useEffect(() => {
    fetch(`${API_URL}/encargados`)
      .then(r => r.json())
      .then(data => setAllEncargados(Array.isArray(data) ? data : []))
      .catch(() => setAllEncargados([]));
  }, []);

  // Filtrar encargados por área y búsqueda
  useEffect(() => {
    if (!searchTerm || searchTerm.trim().length === 0) {
      // Si hay área seleccionada, mostrar encargados de esa área
      if (areaId) {
        const filtered = allEncargados.filter(e => 
          e.areas && e.areas.some(a => a.id === Number(areaId))
        );
        setSuggestions(filtered);
      } else {
        // Mostrar todos los encargados si no hay búsqueda ni área
        setSuggestions(allEncargados.slice(0, 10));
      }
      return;
    }

    // Filtrar por búsqueda
    const searchLower = searchTerm.toLowerCase();
    let filtered = allEncargados.filter(e => 
      e.nombre.toLowerCase().includes(searchLower)
    );

    // Si hay área, priorizar encargados de esa área
    if (areaId) {
      const fromArea = filtered.filter(e => 
        e.areas && e.areas.some(a => a.id === Number(areaId))
      );
      const fromOthers = filtered.filter(e => 
        !e.areas || !e.areas.some(a => a.id === Number(areaId))
      );
      filtered = [...fromArea, ...fromOthers];
    }

    setSuggestions(filtered.slice(0, 10));
  }, [searchTerm, allEncargados, areaId]);

  const handleSelectEncargado = (encargado) => {
    setSearchTerm(encargado.nombre);
    setShowSuggestions(false);
    onChange({ id: encargado.id, nombre: encargado.nombre, isNew: false });
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setShowSuggestions(true);
    
    // Verificar si el nombre escrito coincide exactamente con un encargado existente
    const encargadoExistente = allEncargados.find(
      enc => enc.nombre.toLowerCase().trim() === newValue.toLowerCase().trim()
    );
    
    if (encargadoExistente) {
      // Si existe, usar ese encargado
      onChange({ id: encargadoExistente.id, nombre: encargadoExistente.nombre, isNew: false });
    } else {
      // Si no existe, marcar como nuevo
      onChange({ id: null, nombre: newValue, isNew: true });
    }
  };

  const handleFocus = () => {
    setShowSuggestions(true);
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={handleFocus}
        placeholder={placeholder}
        required={required}
        style={{
          width: '93%',
          padding: '8px 12px',
          border: '1px solid #ccc',
          borderRadius: 6,
          fontSize: '0.95rem'
        }}
      />

      {showSuggestions && suggestions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: 6,
          marginTop: 4,
          maxHeight: 200,
          overflowY: 'auto',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000
        }}>
          {suggestions.map((encargado) => {
            const isFromArea = areaId && encargado.areas && 
              encargado.areas.some(a => a.id === Number(areaId));
            
            return (
              <div
                key={encargado.id}
                onMouseDown={() => handleSelectEncargado(encargado)}
                style={{
                  padding: '10px 12px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f0f0f0',
                  transition: 'background 0.2s',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
              >
                <div>
                  <div style={{ fontWeight: 500, color: '#333' }}>{encargado.nombre}</div>
                  {encargado.areas && encargado.areas.length > 0 && (
                    <div style={{ fontSize: '0.8rem', color: '#666', marginTop: 2 }}>
                      {encargado.areas.map(a => a.nombre).join(', ')}
                    </div>
                  )}
                </div>
                {isFromArea && (
                  <span style={{ 
                    fontSize: '0.75rem', 
                    color: '#4caf50', 
                    fontWeight: 600,
                    marginLeft: 8 
                  }}>
                    ✓ Área actual
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!areaId && searchTerm && (
        <div style={{ fontSize: '0.8rem', color: '#ff9800', marginTop: 4 }}>
          💡 Selecciona un área primero para ver encargados sugeridos
        </div>
      )}
      
      {searchTerm && searchTerm.trim().length > 0 && 
       !suggestions.find(e => e.nombre.toLowerCase() === searchTerm.toLowerCase()) && (
        <div style={{ fontSize: '0.8rem', color: '#2196f3', marginTop: 4 }}>
          ✨ Se creará nuevo encargado: "{searchTerm}"
          {areaId && ' y se asignará al área seleccionada'}
        </div>
      )}
    </div>
  );
};

export default EncargadoAutocomplete;
