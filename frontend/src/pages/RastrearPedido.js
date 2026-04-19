import React, { useState } from 'react';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || '';

const COLORES = {
  pendiente: '#F5C518',
  confirmada: '#3B82F6',
  en_proceso: '#F97316',
  completada: '#22C55E',
  cancelada: '#EF4444',
};

const RastrearPedido = () => {
  const [numero, setNumero] = useState('');
  const [pedido, setPedido] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const buscar = async () => {
    if (!numero.trim()) return;
    setCargando(true);
    setError('');
    setPedido(null);
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/rastrear/${numero.trim()}`);
      setPedido(res.data);
    } catch {
      setError('No encontramos ningún pedido con ese número. Verifica e intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  const completados = pedido?.progreso?.filter(p => p.completado).length || 0;
  const total = pedido?.progreso?.length || 5;
  const porcentaje = pedido ? Math.round((completados / total) * 100) : 0;

  return (
    <div className="container page">
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 className="page-title" style={{ textAlign: 'center' }}>Rastrear Pedido</h1>
        <p className="page-subtitle" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          Ingresa tu número de pedido para ver el estado de tu servicio
        </p>

        <div className="card" style={{ marginBottom: '2rem' }}>
          <label className="form-label">Número de Pedido</label>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              className="form-input"
              placeholder="Ej: MS-2025-0001"
              value={numero}
              onChange={e => setNumero(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && buscar()}
              style={{ margin: 0, flex: 1, fontFamily: 'Barlow Condensed', fontSize: '1.2rem', letterSpacing: '2px' }}
            />
            <button className="btn btn-primary" onClick={buscar} disabled={cargando}>
              {cargando ? '...' : '🔍 Buscar'}
            </button>
          </div>
          {error && <p style={{ color: '#EF4444', marginTop: '0.75rem', fontSize: '0.9rem' }}>{error}</p>}
        </div>

        {pedido && (
          <div className="card">
            {/* Encabezado */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontFamily: 'Barlow Condensed', fontSize: '1.8rem', fontWeight: 800, color: 'var(--amarillo)', letterSpacing: '2px' }}>
                  {pedido.numeroPedido}
                </div>
                <div style={{ color: 'var(--blanco-apagado)', fontSize: '0.9rem' }}>{pedido.nombre}</div>
              </div>
              <span style={{
                background: COLORES[pedido.estado] || '#888',
                color: pedido.estado === 'pendiente' || pedido.estado === 'confirmada' ? '#000' : '#fff',
                padding: '0.4rem 1rem',
                borderRadius: '20px',
                fontFamily: 'Barlow Condensed',
                fontWeight: 700,
                fontSize: '1rem',
                textTransform: 'uppercase'
              }}>
                {pedido.estado.replace('_', ' ')}
              </span>
            </div>

            {/* Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem', padding: '1rem', background: 'var(--gris-medio)', borderRadius: '6px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--blanco-apagado)', marginBottom: '0.2rem' }}>SERVICIO</div>
                <div style={{ fontWeight: 600 }}>{pedido.servicio}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--blanco-apagado)', marginBottom: '0.2rem' }}>FECHA</div>
                <div style={{ fontWeight: 600 }}>
                  {new Date(pedido.fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>

            {/* Progreso */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: '0.85rem', color: 'var(--blanco-apagado)', textTransform: 'uppercase', letterSpacing: '1px' }}>Avance del trabajo</span>
                <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: '1.2rem', color: porcentaje === 100 ? 'var(--verde)' : 'var(--amarillo)' }}>{porcentaje}%</span>
              </div>
              <div style={{ height: '10px', background: 'var(--gris-medio)', borderRadius: '5px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                <div style={{ height: '100%', width: `${porcentaje}%`, background: porcentaje === 100 ? '#22C55E' : 'linear-gradient(90deg, var(--amarillo), #b8920f)', borderRadius: '5px', transition: 'width 0.5s' }} />
              </div>
              <div style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--blanco-apagado)' }}>{completados} de {total} pasos completados</div>
            </div>

            {/* Pasos */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {pedido.progreso?.map((paso, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem',
                  borderRadius: '6px',
                  background: paso.completado ? 'rgba(34,197,94,0.08)' : 'var(--gris-medio)',
                  border: `1px solid ${paso.completado ? '#22C55E' : 'transparent'}`
                }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '0.85rem',
                    background: paso.completado ? '#22C55E' : 'var(--gris-claro)',
                    color: paso.completado ? 'white' : 'var(--blanco-apagado)'
                  }}>{paso.completado ? '✓' : i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: paso.completado ? '#22C55E' : 'var(--blanco-apagado)', textDecoration: paso.completado ? 'line-through' : 'none' }}>
                      {paso.titulo}
                    </div>
                    {paso.completado && paso.fecha && (
                      <div style={{ fontSize: '0.75rem', color: '#22C55E' }}>
                        {new Date(paso.fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {pedido.notasAdmin && (
              <div style={{ marginTop: '1.25rem', padding: '0.75rem', background: 'rgba(245,197,24,0.08)', borderRadius: '6px', borderLeft: '3px solid var(--amarillo)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--amarillo)', marginBottom: '0.3rem', fontWeight: 700 }}>NOTA DEL EQUIPO</div>
                <div style={{ fontSize: '0.9rem' }}>{pedido.notasAdmin}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RastrearPedido;
