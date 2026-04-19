import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const PASOS = ['Datos del Cliente', 'Servicio', 'Fecha y Hora', 'Confirmar'];

const AdminAgendar = () => {
  const navigate = useNavigate();
  const [paso, setPaso] = useState(0);
  const [servicios, setServicios] = useState([]);
  const [disponibilidad, setDisponibilidad] = useState([]);
  const [cargando, setCargando] = useState(false);

  const [form, setForm] = useState({
    nombre: '', apellidoPaterno: '', apellidoMaterno: '',
    telefono: '', email: '', empresa: '',
    servicio: '', fecha: '', hora: '', direccion: '', notas: ''
  });

  useEffect(() => {
    api.get("/api/servicios").then(r => setServicios(Array.isArray(r.data) ? r.data : [])).catch(() => toast.error('Error al cargar servicios'));
  }, []);

  useEffect(() => {
    if (form.fecha) {
      api.get("/api/pedidos/disponibilidad", { params: { fecha: form.fecha } })
        .then(r => setDisponibilidad(r.data.disponibles || []))
        .catch(() => toast.error('Error al verificar disponibilidad'));
    }
  }, [form.fecha]);

  const servicioSeleccionado = servicios.find(s => s._id === form.servicio);
  const hoy = new Date().toISOString().split('T')[0];
  const nombreCompleto = `${form.nombre} ${form.apellidoPaterno} ${form.apellidoMaterno}`.trim();

  const handleSubmit = async () => {
    setCargando(true);
    try {
      await api.post('/api/admin/agendar', form);
      toast.success('¡Pedido creado exitosamente!');
      navigate('/admin/pedidos');
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al crear pedido');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="container page">
      <h1 className="page-title">Nuevo Pedido</h1>
      <p className="page-subtitle">Registra los datos del cliente y crea su pedido</p>

      <div style={{ display: 'flex', marginBottom: '2.5rem', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--gris-medio)' }}>
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

        {paso === 0 && (
          <div>
            <div className="card card-amarillo" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ color: 'var(--amarillo)', marginBottom: '1.25rem', fontSize: '1.3rem' }}>👤 Información del Cliente</h3>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Nombre *</label>
                  <input className="form-input" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Juan" />
                </div>
                <div className="form-group">
                  <label className="form-label">Apellido Paterno *</label>
                  <input className="form-input" value={form.apellidoPaterno} onChange={e => setForm({ ...form, apellidoPaterno: e.target.value })} placeholder="Pérez" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Apellido Materno</label>
                <input className="form-input" value={form.apellidoMaterno} onChange={e => setForm({ ...form, apellidoMaterno: e.target.value })} placeholder="García (opcional)" />
              </div>
              <div className="form-group">
                <label className="form-label">Teléfono *</label>
                <input className="form-input" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} placeholder="477 123 4567" />
              </div>
              <div className="form-group">
                <label className="form-label">Correo Electrónico <span style={{ color: 'var(--blanco-apagado)', fontSize: '0.8rem' }}>(opcional)</span></label>
                <input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="cliente@email.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Empresa <span style={{ color: 'var(--blanco-apagado)', fontSize: '0.8rem' }}>(opcional)</span></label>
                <input className="form-input" value={form.empresa} onChange={e => setForm({ ...form, empresa: e.target.value })} placeholder="Nombre de la empresa" />
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <button className="btn btn-primary" disabled={!form.nombre || !form.apellidoPaterno || !form.telefono} onClick={() => setPaso(1)}>
                Siguiente →
              </button>
            </div>
          </div>
        )}

        {paso === 1 && (
          <div>
            <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', background: 'rgba(245,197,24,0.08)', borderRadius: '4px', borderLeft: '3px solid var(--amarillo)' }}>
              <span style={{ color: 'var(--blanco-apagado)', fontSize: '0.9rem' }}>Cliente: </span>
              <strong style={{ color: 'var(--amarillo)' }}>{nombreCompleto}</strong>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {servicios.map(s => (
                <div key={s._id} className={`servicio-card ${form.servicio === s._id ? 'selected' : ''}`}
                  onClick={() => setForm({ ...form, servicio: s._id })}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{s.nombre}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--blanco-apagado)' }}>{s.categoria.replace(/_/g, ' ')} · {s.duracionMinutos} min</div>
                  </div>
                  <span className="servicio-precio">${s.precio.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'space-between' }}>
              <button className="btn btn-secondary" onClick={() => setPaso(0)}>← Atrás</button>
              <button className="btn btn-primary" disabled={!form.servicio} onClick={() => setPaso(2)}>Siguiente →</button>
            </div>
          </div>
        )}

        {paso === 2 && (
          <div>
            <div className="form-group">
              <label className="form-label">Fecha de el pedido</label>
              <input className="form-input" type="date" min={hoy} value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value, hora: '' })} />
            </div>
            {form.fecha && (
              <div className="form-group">
                <label className="form-label">Horario disponible</label>
                {disponibilidad.length === 0 ? (
                  <p style={{ color: 'var(--rojo)', padding: '1rem 0' }}>No hay horarios disponibles. Elige otra fecha.</p>
                ) : (
                  <div className="horarios-grid">
                    {disponibilidad.map(h => (
                      <button key={h} className={`hora-btn ${form.hora === h ? 'selected' : ''}`} onClick={() => setForm({ ...form, hora: h })}>{h}</button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Dirección del servicio</label>
              <input className="form-input" value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} placeholder="Calle, número, colonia, ciudad" />
            </div>
            <div className="form-group">
              <label className="form-label">Notas adicionales</label>
              <textarea className="form-input" rows={3} value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} placeholder="Detalles del servicio..." style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'space-between' }}>
              <button className="btn btn-secondary" onClick={() => setPaso(1)}>← Atrás</button>
              <button className="btn btn-primary" disabled={!form.fecha || !form.hora} onClick={() => setPaso(3)}>Siguiente →</button>
            </div>
          </div>
        )}

        {paso === 3 && (
          <div>
            <div className="card card-amarillo" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ color: 'var(--amarillo)', marginBottom: '1.25rem', fontSize: '1.4rem' }}>Resumen del Pedido</h3>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {[
                  { label: 'Nombre', valor: form.nombre },
                  { label: 'Apellido Paterno', valor: form.apellidoPaterno },
                  { label: 'Apellido Materno', valor: form.apellidoMaterno || '—' },
                  { label: 'Teléfono', valor: form.telefono },
                  { label: 'Email', valor: form.email || 'No especificado' },
                  { label: 'Empresa', valor: form.empresa || 'No especificada' },
                  { label: 'Servicio', valor: servicioSeleccionado?.nombre },
                  { label: 'Precio', valor: `$${servicioSeleccionado?.precio?.toLocaleString()} MXN` },
                  { label: 'Fecha', valor: new Date(form.fecha + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
                  { label: 'Hora', valor: form.hora },
                  { label: 'Dirección', valor: form.direccion || 'No especificada' },
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
                {cargando ? 'Creando...' : '✓ Confirmar Pedido'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAgendar;
