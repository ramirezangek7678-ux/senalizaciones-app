import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard } from '../services/api';
import toast from 'react-hot-toast';

const COLORES_ESTADO = {
  pendiente:  '#F5C518',
  confirmada: '#3B82F6',
  en_camino: '#F97316',
  entregada:  '#22C55E',
  cancelada:  '#EF4444',
};

const AdminDashboard = () => {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(setDatos)
      .catch(() => toast.error('Error al cargar dashboard'))
      .finally(() => setCargando(false));
  }, []);

  const formatFecha = (fecha) =>
    new Date(fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });

  if (cargando) return <div className="container page"><div className="spinner" /></div>;

  const donacionesPorMes = Array.isArray(datos?.donacionesPorMes) ? datos.donacionesPorMes : [];
  const donacionesPorEstado = Array.isArray(datos?.donacionesPorEstado) ? datos.donacionesPorEstado : [];
  const maxMes = Math.max(...(donacionesPorMes.map(m => m.total) || [1]), 1);
  const totalEstados = donacionesPorEstado.reduce((a, e) => a + e.total, 0) || 1;

  return (
    <div className="container page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Panel de Administración</h1>
        <Link to="/admin/registrar" className="btn btn-primary">+ Nueva Donación</Link>
      </div>
      <p className="page-subtitle">Resumen general del sistema de donaciones</p>

      <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
        {[
          { label: 'Total Donaciones', valor: datos?.totalDonaciones, icono: '📦' },
          { label: 'Donaciones Hoy',   valor: datos?.donacionesHoy,   icono: '📅' },
          { label: 'Pendientes',       valor: datos?.pendientes,      icono: '⏳' },
          { label: 'Voluntarios',      valor: datos?.voluntarios,     icono: '🤝' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{s.icono}</div>
            <div className="stat-number">{s.valor ?? 0}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card">
          <h2 style={{ fontSize: '1.2rem', color: 'var(--amarillo)', marginBottom: '1.5rem' }}>📊 Donaciones por Mes</h2>
          {!donacionesPorMes?.length ? (
            <p style={{ color: 'var(--blanco-apagado)' }}>Sin datos aún</p>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', height: '160px' }}>
              {donacionesPorMes.map((m, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', height: '100%', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--amarillo)', fontWeight: 700 }}>{m.total}</span>
                  <div style={{
                    width: '100%', borderRadius: '4px 4px 0 0',
                    height: `${Math.max((m.total / maxMes) * 120, 6)}px`,
                    background: 'linear-gradient(180deg, var(--amarillo), #b8920f)',
                    transition: 'height 0.5s ease'
                  }} />
                  <span style={{ fontSize: '0.72rem', color: 'var(--blanco-apagado)' }}>{m.mes}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.2rem', color: 'var(--amarillo)', marginBottom: '1.25rem' }}>🥧 Donaciones por Estado</h2>
          {!donacionesPorEstado?.length ? (
            <p style={{ color: 'var(--blanco-apagado)' }}>Sin datos aún</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {donacionesPorEstado.map((e, i) => {
                const pct = Math.round((e.total / totalEstados) * 100);
                const color = COLORES_ESTADO[e.estado] || '#888';
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--blanco)', textTransform: 'capitalize' }}>{e.estado.replace('_', ' ')}</span>
                      <span style={{ color, fontWeight: 700 }}>{e.total} ({pct}%)</span>
                    </div>
                    <div style={{ height: '8px', background: 'var(--gris-medio)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '4px', transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--amarillo)' }}>Próximas Donaciones</h2>
          <Link to="/admin/donaciones" className="btn btn-secondary btn-sm">Ver todas →</Link>
        </div>
        {!datos?.proximasDonaciones?.length ? (
          <p style={{ color: 'var(--blanco-apagado)' }}>No hay donaciones próximas</p>
        ) : (
          <table className="tabla">
            <thead>
              <tr><th>Donante</th><th>Producto</th><th>Fecha</th><th>Hora</th><th>Estado</th></tr>
            </thead>
            <tbody>
              {datos.proximasDonaciones.map(c => (
                <tr key={c._id}>
                  <td><div style={{ fontWeight: 600 }}>{c.nombre ? `${c.nombre} ${c.apellidoPaterno}` : c.donante?.nombre}</div></td>
                  <td>{c.producto?.nombre}</td>
                  <td>{formatFecha(c.fecha)}</td>
                  <td>{c.hora}</td>
                  <td><span className={`badge badge-${c.estado}`}>{c.estado.replace('_', ' ')}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--amarillo)' }}>📅 Solicitudes de Donantes</h2>
          <Link to="/admin/solicitudes" className="btn btn-secondary btn-sm">Ver todas →</Link>
        </div>
        {!datos?.solicitudesDonantes?.length ? (
          <p style={{ color: 'var(--blanco-apagado)' }}>No hay solicitudes pendientes</p>
        ) : (
          <table className="tabla">
            <thead>
              <tr>
                <th>Donante</th>
                <th>Teléfono</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Tipo</th>
              </tr>
            </thead>
            <tbody>
              {datos.solicitudesDonantes.map(c => (
                <tr key={c._id}>
                  <td style={{ fontWeight: 600 }}>{c.nombre} {c.apellidoPaterno}</td>
                  <td>{c.telefono}</td>
                  <td>{new Date(c.fecha).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}</td>
                  <td>{c.hora}</td>
                  <td style={{ fontSize: "0.85rem", color: "var(--blanco-apagado)", textTransform: 'capitalize' }}>{c.tipoDonacion || 'recolección'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="grid-3" style={{ marginTop: '2rem' }}>
        {[
          { to: '/admin/donaciones',           icono: '📦', titulo: 'Gestionar Donaciones', desc: 'Ver, confirmar y actualizar donaciones' },
          { to: '/admin/productos',            icono: '📋', titulo: 'Gestionar Insumos',     desc: 'Agregar y editar el catálogo de insumos' },
          { to: '/admin/voluntarios-registro', icono: '🤝', titulo: 'Ver Voluntarios',       desc: 'Directorio del equipo de voluntarios' },
        ].map(item => (
          <Link key={item.to} to={item.to} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--amarillo)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(245,197,24,0.2)'}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{item.icono}</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem' }}>{item.titulo}</h3>
              <p style={{ color: 'var(--blanco-apagado)', fontSize: '0.9rem' }}>{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;