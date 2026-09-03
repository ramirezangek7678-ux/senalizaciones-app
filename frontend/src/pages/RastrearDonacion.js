import React, { useState } from 'react';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || '';

const COLORES = {
  pendiente:  '#F5C518',
  confirmada: '#3B82F6',
  en_camino: '#F97316',
  entregada:  '#22C55E',
  cancelada:  '#EF4444',
};

const RastrearDonacion = () => {
  const [numero, setNumero] = useState('');
  const [donacion, setDonacion] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const buscar = async () => {
    if (!numero.trim()) return;
    setCargando(true);
    setError('');
    setDonacion(null);
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/rastrear/${numero.trim()}`);
      setDonacion(res.data);
    } catch {
      setError('No encontramos ninguna donación con ese número. Verifica e intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  const completados = donacion?.progreso?.filter(p => p.completado).length || 0;
  const total = donacion?.progreso?.length || 5;
  const porcentaje = donacion ? Math.round((completados / total) * 100) : 0;

  return (
    <div className="container page">
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 className="page-title" style={{ textAlign: 'center' }}>Rastrear Donación</h1>
        <p className="page-subtitle" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          Ingresa tu número de donación para ver el estado
        </p>

        <div className="card" style={{ marginBottom: '2rem' }}>
          <label className="form-label">Número de Donación</label>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              className="form-input"
              placeholder="Ej: DON-2026-0001"
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

        {donacion && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontFamily: 'Barlow Condensed', fontSize: '1.8rem', fontWeight: 800, color: 'var(--amarillo)', letterSpacing: '2px' }}>
                  {donacion.numeroDonacion}
                </div>
                <div style={{ color: 'var(--blanco-apagado)', fontSize: '0.9rem' }}>{donacion.nombre}</div>
              </div>
              <span style={{
                background: COLORES[donacion.estado] || '#888',
                color: donacion.estado === 'pendiente' || donacion.estado === 'confirmada' ? '#000' : '#fff',
                padding: '0.4rem 1rem', borderRadius: '20px',
                fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: '1rem', textTransform: 'uppercase'
              }}>
                {donacion.estado.replace('_', ' ')}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem', padding: '1rem', background: 'var(--gris-medio)', borderRadius: '6px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--blanco-apagado)', marginBottom: '0.2rem' }}>PRODUCTO</div>
                <div style={{ fontWeight: 600 }}>{donacion.producto}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--blanco-apagado)', marginBottom: '0.2rem' }}>FECHA</div>
                <div style={{ fontWeight: 600 }}>
                  {new Date(donacion.fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: '0.85rem', color: 'var(--blanco-apagado)', textTransform: 'uppercase', letterSpacing: '1px' }}>Avance de la entrega</span>
                <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: '1.2rem', color: porcentaje === 100 ? 'var(--verde)' : 'var(--amarillo)' }}>{porcentaje}%</span>
              </div>
              <div style={{ height: '10px', background: 'var(--gris-medio)', borderRadius: '5px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                <div style={{ height: '100%', width: `${porcentaje}%`, background: porcentaje === 100 ? '#22C55E' : 'linear-gradient(90deg, var(--amarillo), #b8920f)', borderRadius: '5px', transition: 'width 0.5s' }} />
              </div>
              <div style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--blanco-apagado)' }}>{completados} de {total} pasos completados</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {donacion.progreso?.map((paso, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '6px',
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

            {donacion.notasAdmin && (
              <div style={{ marginTop: '1.25rem', padding: '0.75rem', background: 'rgba(245,197,24,0.08)', borderRadius: '6px', borderLeft: '3px solid var(--amarillo)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--amarillo)', marginBottom: '0.3rem', fontWeight: 700 }}>NOTA DEL EQUIPO</div>
                <div style={{ fontSize: '0.9rem' }}>{donacion.notasAdmin}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RastrearDonacion;