import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMisDonaciones, cancelarDonacion } from '../services/api';
import toast from 'react-hot-toast';

const MisDonaciones = () => {
  const [donaciones, setDonaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargar = () => {
    getMisDonaciones()
      .then(setDonaciones)
      .catch(() => toast.error('Error al cargar tus donaciones'))
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargar(); }, []);

  const handleCancelar = async (id) => {
    if (!window.confirm('¿Estás seguro de cancelar esta donación?')) return;
    try {
      await cancelarDonacion(id);
      toast.success('Donación cancelada');
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
          <h1 className="page-title">Mis Donaciones</h1>
          <p className="page-subtitle">Historial y estado de tus donaciones realizadas</p>
        </div>
        <Link to="/productos" className="btn btn-primary">+ Nueva Donación</Link>
      </div>

      {cargando ? (
        <div className="spinner" />
      ) : donaciones.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📦</div>
          <h3 style={{ marginBottom: '0.5rem' }}>Sin donaciones registradas</h3>
          <p style={{ marginBottom: '1.5rem' }}>Realiza tu primera donación y ayuda a quien lo necesita</p>
          <Link to="/productos" className="btn btn-primary">Nueva Donación</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {donaciones.map(donacion => (
            <div key={donacion._id} className="card card-amarillo">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.2rem' }}>{donacion.producto?.nombre}</h3>
                    <span className={`badge badge-${donacion.estado}`}>{donacion.estado.replace('_', ' ')}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                    <div style={{ color: 'var(--blanco-apagado)', fontSize: '0.9rem' }}>
                      📅 {formatFecha(donacion.fecha)}
                    </div>
                    <div style={{ color: 'var(--blanco-apagado)', fontSize: '0.9rem' }}>
                      🕐 {donacion.hora} hrs
                    </div>
                    <div style={{ color: 'var(--blanco-apagado)', fontSize: '0.9rem' }}>
                      📦 {donacion.cantidad} {donacion.unidad}{donacion.cantidad !== 1 ? 's' : ''}
                    </div>
                    {donacion.direccion && (
                      <div style={{ color: 'var(--blanco-apagado)', fontSize: '0.9rem' }}>
                        📍 {donacion.direccion}
                      </div>
                    )}
                  </div>
                  {donacion.notasAdmin && (
                    <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(245,197,24,0.08)', borderRadius: '4px', fontSize: '0.9rem' }}>
                      <strong style={{ color: 'var(--amarillo)' }}>Nota del equipo: </strong>
                      {donacion.notasAdmin}
                    </div>
                  )}
                </div>
                <div>
                  {(donacion.estado === 'pendiente' || donacion.estado === 'confirmada') && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleCancelar(donacion._id)}>
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

export default MisDonaciones;