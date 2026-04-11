import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getServicios, getDisponibilidad, crearPedido } from '../services/api';
import toast from 'react-hot-toast';

const PASOS = ['Servicio', 'Fecha y Hora', 'Detalles', 'Confirmar'];

const Agendar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const servicioPreseleccionado = location.state?.servicioId || '';

  const [paso, setPaso] = useState(servicioPreseleccionado ? 1 : 0);
  const [servicios, setServicios] = useState([]);
  const [disponibilidad, setDisponibilidad] = useState([]);
  const [cargando, setCargando] = useState(false);

  const [form, setForm] = useState({
    servicio: servicioPreseleccionado,
    fecha: '',
    hora: '',
    direccion: '',
    notas: ''
  });

  useEffect(() => {
    getServicios().then(setServicios).catch(() => toast.error('Error al cargar servicios'));
  }, []);

  useEffect(() => {
    if (form.fecha) {
      getDisponibilidad(form.fecha)
        .then(d => setDisponibilidad(d.disponibles))
        .catch(() => toast.error('Error al verificar disponibilidad'));
    }
  }, [form.fecha]);

  const servicioSeleccionado = servicios.find(s => s._id === form.servicio);

  const hoy = new Date().toISOString().split('T')[0];

  const handleSubmit = async () => {
    setCargando(true);
    try {
      await crearPedido(form);
      toast.success('¡Pedido creado exitosamente!');
      navigate('/mis-pedidos');
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al crear pedido');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="container page">
      <h1 className="page-title">Crear Pedido</h1>

      {/* Barra de pasos */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '2.5rem', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--gris-medio)' }}>
        {PASOS.map((p, i) => (
          <div key={i} style={{
            flex: 1, padding: '0.75rem', textAlign: 'center',
            background: i === paso ? 'var(--amarillo)' : i < paso ? 'var(--gris-medio)' : 'var(--gris-oscuro)',
            color: i === paso ? 'var(--negro)' : i < paso ? 'var(--amarillo)' : 'var(--blanco-apagado)',
            fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: '0.9rem',
            letterSpacing: '0.5px', textTransform: 'uppercase', transition: 'all 0.3s'
          }}>
            {i < paso ? '✓ ' : `${i + 1}. `}{p}
          </div>
        ))}
      </div>

      <div style={{ maxWidth: '640px', margin: '0 auto' }}>

        {/* PASO 0: Seleccionar servicio */}
        {paso === 0 && (
          <div>
            <h3 style={{ marginBottom: '1.25rem', color: 'var(--blanco-apagado)', fontSize: '1.1rem' }}>Selecciona el servicio que necesitas</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {servicios.map(s => (
                <div
                  key={s._id}
                  className={`servicio-card ${form.servicio === s._id ? 'selected' : ''}`}
                  onClick={() => setForm({ ...form, servicio: s._id })}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{s.nombre}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--blanco-apagado)' }}>{s.duracionMinutos} min</div>
                  </div>
                  <span className="servicio-precio">${s.precio.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button className="btn btn-primary" disabled={!form.servicio} onClick={() => setPaso(1)}>
                Siguiente →
              </button>
            </div>
          </div>
        )}

        {/* PASO 1: Fecha y hora */}
        {paso === 1 && (
          <div>
            <div className="form-group">
              <label className="form-label">Fecha del pedido</label>
              <input
                className="form-input"
                type="date"
                min={hoy}
                value={form.fecha}
                onChange={e => { setForm({ ...form, fecha: e.target.value, hora: '' }); }}
              />
            </div>

            {form.fecha && (
              <div className="form-group">
                <label className="form-label">Horario disponible</label>
                {disponibilidad.length === 0 ? (
                  <p style={{ color: 'var(--rojo)', padding: '1rem 0' }}>No hay horarios disponibles para esta fecha. Elige otra.</p>
                ) : (
                  <div className="horarios-grid">
                    {disponibilidad.map(h => (
                      <button
                        key={h}
                        className={`hora-btn ${form.hora === h ? 'selected' : ''}`}
                        onClick={() => setForm({ ...form, hora: h })}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'space-between' }}>
              <button className="btn btn-secondary" onClick={() => setPaso(0)}>← Atrás</button>
              <button className="btn btn-primary" disabled={!form.fecha || !form.hora} onClick={() => setPaso(2)}>
                Siguiente →
              </button>
            </div>
          </div>
        )}

        {/* PASO 2: Detalles */}
        {paso === 2 && (
          <div>
            <div className="form-group">
              <label className="form-label">Dirección de instalación / visita</label>
              <input
                className="form-input"
                value={form.direccion}
                onChange={e => setForm({ ...form, direccion: e.target.value })}
                placeholder="Calle, número, colonia, ciudad"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Notas adicionales (opcional)</label>
              <textarea
                className="form-input"
                rows={4}
                value={form.notas}
                onChange={e => setForm({ ...form, notas: e.target.value })}
                placeholder="Describe brevemente tu necesidad o cualquier detalle relevante..."
                style={{ resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'space-between' }}>
              <button className="btn btn-secondary" onClick={() => setPaso(1)}>← Atrás</button>
              <button className="btn btn-primary" onClick={() => setPaso(3)}>Siguiente →</button>
            </div>
          </div>
        )}

        {/* PASO 3: Confirmar */}
        {paso === 3 && (
          <div>
            <div className="card card-amarillo" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ color: 'var(--amarillo)', marginBottom: '1.25rem', fontSize: '1.4rem' }}>Resumen de tu pedido</h3>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {[
                  { label: 'Servicio', valor: servicioSeleccionado?.nombre },
                  { label: 'Precio', valor: `$${servicioSeleccionado?.precio?.toLocaleString()} MXN` },
                  { label: 'Fecha', valor: new Date(form.fecha + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
                  { label: 'Hora', valor: form.hora },
                  { label: 'Dirección', valor: form.direccion || 'No especificada' },
                  { label: 'Notas', valor: form.notas || 'Sin notas' },
                ].map(({ label, valor }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--gris-medio)', paddingBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--blanco-apagado)', fontSize: '0.9rem' }}>{label}</span>
                    <span style={{ fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>{valor}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
              <button className="btn btn-secondary" onClick={() => setPaso(2)}>← Atrás</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={cargando}>
                {cargando ? 'Creando pedido...' : '✓ Confirmar Pedido'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Agendar;
