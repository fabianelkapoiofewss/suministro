import React, { createContext, useContext, useState, useCallback } from 'react';
const ToastContext = createContext();
export const useToast = () => useContext(ToastContext);
export function ToastProvider({ children }){
  const [toasts,setToasts]=useState([]);
  const remove=useCallback(id=>setToasts(t=>t.filter(x=>x.id!==id)),[]);
  const showToast=useCallback((message,type='info',duration=3500)=>{ const id=Date.now()+Math.random(); setToasts(t=>[...t,{id,message,type}]); if(duration>0) setTimeout(()=>remove(id),duration); },[remove]);
  return <ToastContext.Provider value={{showToast}}>
    {children}
    <div className="toast-container">{toasts.map(t=> <div key={t.id} className={`toast toast-${t.type}`}><span>{t.message}</span><button className="toast-close" onClick={()=>remove(t.id)} aria-label="Cerrar">×</button></div>)}</div>
  </ToastContext.Provider>;
}
