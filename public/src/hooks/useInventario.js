import { useEffect, useState, useCallback } from 'react';
const API = 'http://localhost:3434';
export function useInventario(){
  const [inventario,setInventario]=useState([]);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState(null);
  const fetchInventario=useCallback(async()=>{ setLoading(true); setError(null); try{ const res=await fetch(`${API}/inventarios`); let data=null; try{ data=await res.json(); }catch{}; if(!res.ok) throw new Error(data?.error||'Error cargando inventario'); setInventario(Array.isArray(data)? data: []);}catch(e){ setInventario([]); setError(e.message);} finally{ setLoading(false);} },[]);
  const uploadExcel=async(file)=>{ const fd=new FormData(); fd.append('file',file); const res=await fetch(`${API}/inventarios/upload`,{method:'POST',body:fd}); let data=null; try{data=await res.json();}catch{}; if(!res.ok) throw new Error(data?.error||'Error al subir archivo'); await fetchInventario(); return data; };
  const updateItem=async(id,payload)=>{ const res=await fetch(`${API}/inventarios/${id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}); let d=null; try{d=await res.json();}catch{}; if(!res.ok) throw new Error(d?.error||'Error actualizando inventario'); await fetchInventario(); return d; };
  useEffect(()=>{ fetchInventario(); },[fetchInventario]);
  return { inventario, loading, error, refresh: fetchInventario, uploadExcel, updateItem };
}
