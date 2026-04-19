import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard } from '../services/api';
import toast from 'react-hot-toast';

const COLORES_ESTADO = {
  pendiente:  '#F5C518',
  confirmada: '#3B82F6',
  en_proceso: '#F97316',
  completada: '#22C55E',
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

  const pedidosPorMes = Array.isArray(datos?.pedidosPorMes) ? datos.pedidosPorMes : [];
  const pedidosPorEstado = Array.isArray(datos?.pedidosPorEstado) ? datos.pedidosPorEstado : [];
  const maxMes = Math.max(...(pedidosPorMes.map(m => m.total) || [1]), 1);
  const totalEstados = pedidosPorEstado.reduce((a, e) => a + e.total, 0) || 1;

  return (
    <div className="container page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Panel de Administración</h1>
        <Link to="/admin/agendar" className="btn btn-primary">+ Nuevo Pedido</Link>
      </div>
      <p className="page-subtitle">Resumen general del sistema de pedidos</p>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
        {[
          { label: 'Total Pedidos', valor: datos?.totalPedidos, icono: '📋' },
          { label: 'Pedidos Hoy',   valor: datos?.pedidosHoy,   icono: '📅' },
          { label: 'Pendientes',    valor: datos?.pendientes,    icono: '⏳' },
          { label: 'Empleados',     valor: datos?.empleados,     icono: '👷' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{s.icono}</div>
            <div className="stat-number">{s.valor ?? 0}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Graficas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>

        {/* Barras por mes */}
        <div className="card">
          <h2 style={{ fontSize: '1.2rem', color: 'var(--amarillo)', marginBottom: '1.5rem' }}>📊 Pedidos por Mes</h2>
          {!pedidosPorMes?.length ? (
            <p style={{ color: 'var(--blanco-apagado)' }}>Sin datos aún</p>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', height: '160px' }}>
              {datos.pedidosPorMes.map((m, i) => (
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

        {/* Barras por estado */}
        <div className="card">
          <h2 style={{ fontSize: '1.2rem', color: 'var(--amarillo)', marginBottom: '1.25rem' }}>🥧 Pedidos por Estado</h2>
          {!pedidosPorEstado?.length ? (
            <p style={{ color: 'var(--blanco-apagado)' }}>Sin datos aún</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {datos.pedidosPorEstado.map((e, i) => {
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

      {/* Proximos pedidos */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--amarillo)' }}>Próximos Pedidos</h2>
          <Link to="/admin/pedidos" className="btn btn-secondary btn-sm">Ver todos →</Link>
        </div>
        {!datos?.proximosPedidos?.length ? (
          <p style={{ color: 'var(--blanco-apagado)' }}>No hay pedidos próximos</p>
        ) : (
          <table className="tabla">
            <thead>
              <tr><th>Cliente</th><th>Servicio</th><th>Fecha</th><th>Hora</th><th>Estado</th></tr>
            </thead>
            <tbody>
              {datos.proximosPedidos.map(c => (
                <tr key={c._id}>
                  <td><div style={{ fontWeight: 600 }}>{c.nombre ? `${c.nombre} ${c.apellidoPaterno}` : c.cliente?.nombre}</div></td>
                  <td>{c.servicio?.nombre}</td>
                  <td>{formatFecha(c.fecha)}</td>
                  <td>{c.hora}</td>
                  <td><span className={`badge badge-${c.estado}`}>{c.estado}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Accesos rapidos */}
      <div className="grid-3" style={{ marginTop: '2rem' }}>
        {[
          { to: '/admin/pedidos',      icono: '📋', titulo: 'Gestionar Pedidos',   desc: 'Ver, confirmar y actualizar pedidos' },
          { to: '/admin/servicios',    icono: '🔧', titulo: 'Gestionar Servicios', desc: 'Agregar y editar el catálogo' },
          { to: '/admin/trabajadores', icono: '👷', titulo: 'Ver Trabajadores',    desc: 'Directorio del equipo de trabajo' },
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
