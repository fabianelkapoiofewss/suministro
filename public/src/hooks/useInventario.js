import { useEffect, useState, useCallback } from 'react';
import API_URL from '../config/api';
const API = API_URL;

export function useInventario() {
  const [inventario, setInventario] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const limit = 50; // Cargar 50 registros por página

  const fetchInventario = useCallback(async (pageNum = 1, append = false) => {
    setLoading(true);
    setError(null);
    setIsSearching(false);
    try {
      const res = await fetch(`${API}/inventarios?page=${pageNum}&limit=${limit}`);
      let data = null;
      try {
        data = await res.json();
      } catch {}
      
      if (!res.ok) throw new Error(data?.error || 'Error cargando inventario');
      
      const inventarios = data.inventarios || [];
      const total = data.totalPages || 1;
      
      if (append) {
        setInventario(prev => [...prev, ...inventarios]);
      } else {
        setInventario(inventarios);
      }
      
      setTotalPages(total);
      setHasMore(pageNum < total);
      setPage(pageNum);
    } catch (e) {
      if (!append) setInventario([]);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (hasMore && !loading && !isSearching) {
      fetchInventario(page + 1, true);
    }
  }, [page, hasMore, loading, isSearching, fetchInventario]);

  const refresh = useCallback(() => {
    setPage(1);
    setHasMore(true);
    setIsSearching(false);
    fetchInventario(1, false);
  }, [fetchInventario]);

  const searchInventario = useCallback(async (query) => {
    if (!query || query.trim().length === 0) {
      // Si no hay query, volver a cargar normalmente
      refresh();
      return;
    }

    setLoading(true);
    setError(null);
    setIsSearching(true);
    try {
      const res = await fetch(`${API}/inventarios/search?q=${encodeURIComponent(query.trim())}`);
      let data = null;
      try {
        data = await res.json();
      } catch {}
      
      if (!res.ok) throw new Error(data?.error || 'Error en la búsqueda');
      
      setInventario(Array.isArray(data) ? data : []);
      setHasMore(false); // No hay paginación en búsqueda
      setPage(1);
    } catch (e) {
      setInventario([]);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const uploadExcel = async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(`${API}/inventarios/upload`, { method: 'POST', body: fd });
    let data = null;
    try {
      data = await res.json();
    } catch {}
    if (!res.ok) throw new Error(data?.error || 'Error al subir archivo');
    await refresh();
    return data;
  };

  const updateItem = async (id, payload) => {
    const res = await fetch(`${API}/inventarios/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    let d = null;
    try {
      d = await res.json();
    } catch {}
    if (!res.ok) throw new Error(d?.error || 'Error actualizando inventario');
    await refresh();
    return d;
  };

  useEffect(() => {
    fetchInventario(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { 
    inventario, 
    loading, 
    error, 
    refresh, 
    uploadExcel, 
    updateItem,
    loadMore,
    hasMore,
    page,
    totalPages,
    searchInventario,
    isSearching
  };
}
