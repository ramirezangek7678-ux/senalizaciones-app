import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getServicios } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CATEGORIAS = [
  { value: '', label: 'Todos' },
  { value: 'señalamientos_viales', label: 'Viales' },
  { value: 'señalamientos_industriales', label: 'Industriales' },
  { value: 'señalamientos_comerciales', label: 'Comerciales' },
  { value: 'consultoria', label: 'Consultoría' },
  { value: 'instalacion', label: 'Instalación' },
];

const Servicios = () => {
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [categoria, setCategoria] = useState('');
  const { usuario } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setCargando(true);
    getServicios(categoria)
      .then(setServicios)
      .catch(() => toast.error('Error al cargar servicios'))
      .finally(() => setCargando(false));
  }, [categoria]);

  const handleAgendar = (servicio) => {
    if (!usuario) {
      toast('Inicia sesión para crear un pedido', { icon: '🔒' });
      navigate('/login');
      return;
    }
    navigate('/agendar', { state: { servicioId: servicio._id } });
  };

  const etiquetaCategoria = (cat) => cat.replace(/_/g, ' ');

  return (
    <div className="container page">
      <h1 className="page-title">Nuestros Servicios</h1>
      <p className="page-subtitle">Selecciona el servicio que necesitas y realiza tu pedido</p>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {CATEGORIAS.map(c => (
          <button
            key={c.value}
            onClick={() => setCategoria(c.value)}
            className={`btn btn-sm ${categoria === c.value ? 'btn-primary' : 'btn-secondary'}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {cargando ? (
        <div className="spinner" />
      ) : servicios.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🔧</div>
          <p>No hay servicios disponibles en esta categoría</p>
        </div>
      ) : (
        <div className="grid-3">
          {servicios.map(s => (
            <div key={s._id} className="servicio-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span className="servicio-categoria">{etiquetaCategoria(s.categoria)}</span>
                <span className="servicio-precio">${s.precio.toLocaleString()}</span>
              </div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: 'var(--blanco)' }}>{s.nombre}</h3>
              <p style={{ color: 'var(--blanco-apagado)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                {s.descripcion}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--blanco-apagado)', fontSize: '0.85rem' }}>
                  ⏱ {s.duracionMinutos} min
                </span>
                <button className="btn btn-primary btn-sm" onClick={() => handleAgendar(s)}>
                  Agendar →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Servicios;
