import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMisCitas, cancelarCita } from '../services/api';
import toast from 'react-hot-toast';

const MisCitas = () => {
  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargar = () => {
    getMisCitas()
      .then(setCitas)
      .catch(() => toast.error('Error al cargar tus citas'))
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargar(); }, []);

  const handleCancelar = async (id) => {
    if (!window.confirm('¿Estás seguro de cancelar esta cita?')) return;
    try {
      await cancelarCita(id);
      toast.success('Cita cancelada');
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
          <h1 className="page-title">Mis Citas</h1>
          <p className="page-subtitle">Historial y estado de tus citas agendadas</p>
        </div>
        <Link to="/agendar" className="btn btn-primary">+ Nueva Cita</Link>
      </div>

      {cargando ? (
        <div className="spinner" />
      ) : citas.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📅</div>
          <h3 style={{ marginBottom: '0.5rem' }}>Sin citas agendadas</h3>
          <p style={{ marginBottom: '1.5rem' }}>Agenda tu primera cita con nosotros</p>
          <Link to="/agendar" className="btn btn-primary">Agendar Cita</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {citas.map(cita => (
            <div key={cita._id} className="card card-amarillo">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.2rem' }}>{cita.servicio?.nombre}</h3>
                    <span className={`badge badge-${cita.estado}`}>{cita.estado}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                    <div style={{ color: 'var(--blanco-apagado)', fontSize: '0.9rem' }}>
                      📅 {formatFecha(cita.fecha)}
                    </div>
                    <div style={{ color: 'var(--blanco-apagado)', fontSize: '0.9rem' }}>
                      🕐 {cita.hora} hrs
                    </div>
                    <div style={{ color: 'var(--blanco-apagado)', fontSize: '0.9rem' }}>
                      💰 ${cita.servicio?.precio?.toLocaleString()} MXN
                    </div>
                    {cita.direccion && (
                      <div style={{ color: 'var(--blanco-apagado)', fontSize: '0.9rem' }}>
                        📍 {cita.direccion}
                      </div>
                    )}
                  </div>
                  {cita.notasAdmin && (
                    <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(245,197,24,0.08)', borderRadius: '4px', fontSize: '0.9rem' }}>
                      <strong style={{ color: 'var(--amarillo)' }}>Nota del equipo: </strong>
                      {cita.notasAdmin}
                    </div>
                  )}
                </div>
                <div>
                  {(cita.estado === 'pendiente' || cita.estado === 'confirmada') && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleCancelar(cita._id)}>
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

export default MisCitas;
