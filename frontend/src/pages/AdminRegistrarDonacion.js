import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const PASOS = ['Datos del Donante', 'Producto', 'Fecha y Hora', 'Confirmar'];

const AdminRegistrarDonacion = () => {
  const navigate = useNavigate();
  const [paso, setPaso] = useState(0);
  const [productos, setProductos] = useState([]);
  const [disponibilidad, setDisponibilidad] = useState([]);
  const [cargando, setCargando] = useState(false);

  const [form, setForm] = useState({
    nombre: '', apellidoPaterno: '', apellidoMaterno: '',
    telefono: '', email: '', organizacion: '',
    producto: '', cantidad: 1, unidad: 'pieza',
    fecha: '', hora: '', direccion: '', notas: ''
  });

  useEffect(() => {
    api.get("/api/productos").then(r => setProductos(Array.isArray(r.data) ? r.data : [])).catch(() => toast.error('Error al cargar insumos'));
  }, []);

  useEffect(() => {
    if (form.fecha) {
      api.get("/api/donaciones/disponibilidad", { params: { fecha: form.fecha } })
        .then(r => setDisponibilidad(r.data.disponibles || []))
        .catch(() => toast.error('Error al verificar disponibilidad'));
    }
  }, [form.fecha]);

  const productoSeleccionado = productos.find(p => p._id === form.producto);
  const hoy = new Date().toISOString().split('T')[0];
  const nombreCompleto = `${form.nombre} ${form.apellidoPaterno} ${form.apellidoMaterno}`.trim();

  const handleSubmit = async () => {
    setCargando(true);
    try {
      await api.post('/api/admin/registrar-donacion', form);
      toast.success('¡Donación registrada exitosamente!');
      navigate('/admin/donaciones');
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al registrar donación');
    } finally {
      setCargando(false);
    }
  };

  const elegirProducto = (p) => {
    setForm({ ...form, producto: p._id, unidad: p.unidad });
  };

  return (
    <div className="container page">
      <h1 className="page-title">Registrar Donación</h1>
      <p className="page-subtitle">Captura los datos del donante y registra su donación</p>

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
              <h3 style={{ color: 'var(--amarillo)', marginBottom: '1.25rem', fontSize: '1.3rem' }}>👤 Información del Donante</h3>
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
                <input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="donante@email.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Organización <span style={{ color: 'var(--blanco-apagado)', fontSize: '0.8rem' }}>(opcional)</span></label>
                <input className="form-input" value={form.organizacion} onChange={e => setForm({ ...form, organizacion: e.target.value })} placeholder="Empresa o fundación" />
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
              <span style={{ color: 'var(--blanco-apagado)', fontSize: '0.9rem' }}>Donante: </span>
              <strong style={{ color: 'var(--amarillo)' }}>{nombreCompleto}</strong>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {productos.map(p => (
                <div key={p._id} className={`servicio-card ${form.producto === p._id ? 'selected' : ''}`}
                  onClick={() => elegirProducto(p)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{p.nombre}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--blanco-apagado)' }}>{p.categoria.replace(/_/g, ' ')} · {p.unidad}</div>
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--blanco-apagado)' }}>Meta: {p.meta}</span>
                </div>
              ))}
            </div>
            {form.producto && (
              <div className="card" style={{ marginTop: '1rem', padding: '1rem' }}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Cantidad *</label>
                    <input className="form-input" type="number" min="1" value={form.cantidad} onChange={e => setForm({ ...form, cantidad: parseInt(e.target.value) || 1 })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Unidad</label>
                    <input className="form-input" value={form.unidad} onChange={e => setForm({ ...form, unidad: e.target.value })} />
                  </div>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'space-between' }}>
              <button className="btn btn-secondary" onClick={() => setPaso(0)}>← Atrás</button>
              <button className="btn btn-primary" disabled={!form.producto || !form.cantidad} onClick={() => setPaso(2)}>Siguiente →</button>
            </div>
          </div>
        )}

        {paso === 2 && (
          <div>
            <div className="form-group">
              <label className="form-label">Fecha de la donación</label>
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
              <label className="form-label">Dirección de recolección/entrega</label>
              <input className="form-input" value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} placeholder="Calle, número, colonia, ciudad" />
            </div>
            <div className="form-group">
              <label className="form-label">Notas adicionales</label>
              <textarea className="form-input" rows={3} value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} placeholder="Detalles de la donación..." style={{ resize: 'vertical' }} />
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
              <h3 style={{ color: 'var(--amarillo)', marginBottom: '1.25rem', fontSize: '1.4rem' }}>Resumen de la Donación</h3>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {[
                  { label: 'Nombre', valor: form.nombre },
                  { label: 'Apellido Paterno', valor: form.apellidoPaterno },
                  { label: 'Apellido Materno', valor: form.apellidoMaterno || '—' },
                  { label: 'Teléfono', valor: form.telefono },
                  { label: 'Email', valor: form.email || 'No especificado' },
                  { label: 'Organización', valor: form.organizacion || 'No especificada' },
                  { label: 'Producto', valor: productoSeleccionado?.nombre },
                  { label: 'Cantidad', valor: `${form.cantidad} ${form.unidad}` },
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
                {cargando ? 'Registrando...' : '✓ Confirmar Donación'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRegistrarDonacion;