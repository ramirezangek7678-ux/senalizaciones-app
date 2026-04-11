import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMisPedidos, cancelarPedido } from '../services/api';
import toast from 'react-hot-toast';

const MisPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargar = () => {
    getMisPedidos()
      .then(setPedidos)
      .catch(() => toast.error('Error al cargar tus pedidos'))
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargar(); }, []);

  const handleCancelar = async (id) => {
    if (!window.confirm('¿Estás seguro de cancelar este pedido?')) return;
    try {
      await cancelarPedido(id);
      toast.success('Pedido cancelado');
      cargar();
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al cancelar');
    }
  };

  const formatFecha = (fecha) =>
    new Date(fecha).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="container page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Mis Pedidos</h1>
          <p className="page-subtitle">Historial y estado de tus pedidos realizados</p>
        </div>
        <Link to="/agendar" className="btn btn-primary">+ Nuevo Pedido</Link>
      </div>

      {cargando ? (
        <div className="spinner" />
      ) : pedidos.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📅</div>
          <h3 style={{ marginBottom: '0.5rem' }}>Sin pedidos realizados</h3>
          <p style={{ marginBottom: '1.5rem' }}>Realiza tu primer pedido con nosotros</p>
          <Link to="/agendar" className="btn btn-primary">Nuevo Pedido</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {pedidos.map(pedido => (
            <div key={pedido._id} className="card card-amarillo">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.2rem' }}>{pedido.servicio?.nombre}</h3>
                    <span className={`badge badge-${pedido.estado}`}>{pedido.estado}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                    <div style={{ color: 'var(--blanco-apagado)', fontSize: '0.9rem' }}>
                      📅 {formatFecha(pedido.fecha)}
                    </div>
                    <div style={{ color: 'var(--blanco-apagado)', fontSize: '0.9rem' }}>
                      🕐 {pedido.hora} hrs
                    </div>
                    <div style={{ color: 'var(--blanco-apagado)', fontSize: '0.9rem' }}>
                      💰 ${pedido.servicio?.precio?.toLocaleString()} MXN
                    </div>
                    {pedido.direccion && (
                      <div style={{ color: 'var(--blanco-apagado)', fontSize: '0.9rem' }}>
                        📍 {pedido.direccion}
                      </div>
                    )}
                  </div>
                  {pedido.notasAdmin && (
                    <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(245,197,24,0.08)', borderRadius: '4px', fontSize: '0.9rem' }}>
                      <strong style={{ color: 'var(--amarillo)' }}>Nota del equipo: </strong>
                      {pedido.notasAdmin}
                    </div>
                  )}
                </div>
                <div>
                  {(pedido.estado === 'pendiente' || pedido.estado === 'confirmada') && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleCancelar(pedido._id)}>
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MisPedidos;
