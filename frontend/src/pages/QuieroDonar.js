import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const BASE_URL = process.env.REACT_APP_API_URL || '';

const HORARIOS = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'];

const QuieroDonar = () => {
  const [cargando, setCargando] = useState(false);
  const [donacionCreada, setDonacionCreada] = useState(null);
  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState({
    nombre: '', apellidoPaterno: '', telefono: '',
    email: '', organizacion: '',
    producto: '', cantidad: 1, unidad: 'pieza',
    fecha: '', hora: '',
    tipoDonacion: 'recoleccion',
    direccion: '', notas: ''
  });

  useEffect(() => {
    axios.get(`${BASE_URL}/api/productos`)
      .then(r => setProductos(Array.isArray(r.data) ? r.data : []))
      .catch(() => toast.error('Error al cargar insumos'));
  }, []);

  const hoy = new Date().toISOString().split('T')[0];

  const handleSubmit = async () => {
    if (!form.nombre || !form.apellidoPaterno || !form.telefono || !form.producto || !form.cantidad || !form.fecha || !form.hora)
      return toast.error('Completa todos los campos obligatorios');
    setCargando(true);
    try {
      const res = await axios.post(`${BASE_URL}/api/donaciones/publico`, form);
      setDonacionCreada(res.data.numeroDonacion);
      toast.success('¡Donación registrada!');
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al registrar donación');
    } finally {
      setCargando(false);
    }
  };

  if (donacionCreada) {
    return (
      <div className="container page">
        <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❤️</div>
          <h1 style={{ fontFamily: 'Barlow Condensed', fontSize: '2.5rem', fontWeight: 800, color: 'var(--amarillo)', marginBottom: '0.5rem' }}>
            ¡Gracias por tu Donación!
          </h1>
          <p style={{ color: 'var(--blanco-apagado)', marginBottom: '1.5rem' }}>
            Tu donación fue registrada. Pronto te contactaremos para confirmar la logística.
          </p>
          <div style={{ background: 'var(--gris-medio)', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem', border: '2px solid var(--amarillo)' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--blanco-apagado)', marginBottom: '0.4rem' }}>TU NÚMERO DE DONACIÓN</div>
            <div style={{ fontFamily: 'Barlow Condensed', fontSize: '2.5rem', fontWeight: 800, color: 'var(--amarillo)', letterSpacing: '3px' }}>
              {donacionCreada}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--blanco-apagado)', marginTop: '0.4rem' }}>
              Guárdalo para dar seguimiento
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/" className="btn btn-primary">Volver al Inicio</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container page">
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <h1 className="page-title">Quiero Donar</h1>
        <p className="page-subtitle" style={{ marginBottom: '2rem' }}>
          Registra tu donación. No necesitas crear cuenta.
        </p>

        <div className="card">
          <h3 style={{ color: 'var(--amarillo)', marginBottom: '1.25rem', fontSize: '1.1rem' }}>
            👤 Tus datos
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Nombre *</label>
              <input className="form-input" value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Juan" />
            </div>
            <div className="form-group">
              <label className="form-label">Apellido *</label>
              <input className="form-input" value={form.apellidoPaterno}
                onChange={e => setForm({ ...form, apellidoPaterno: e.target.value })} placeholder="Pérez" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Teléfono *</label>
              <input className="form-input" value={form.telefono}
                onChange={e => setForm({ ...form, telefono: e.target.value })} placeholder="477 123 4567" />
            </div>
            <div className="form-group">
              <label className="form-label">Email (opcional)</label>
              <input className="form-input" type="email" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} placeholder="correo@ejemplo.com" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Organización (opcional)</label>
            <input className="form-input" value={form.organizacion}
              onChange={e => setForm({ ...form, organizacion: e.target.value })}
              placeholder="Empresa, fundación o grupo al que perteneces" />
          </div>

          <h3 style={{ color: 'var(--amarillo)', margin: '1.5rem 0 1.25rem', fontSize: '1.1rem' }}>
            📦 ¿Qué vas a donar?
          </h3>

          <div className="form-group">
            <label className="form-label">Insumo *</label>
            <select className="form-input" value={form.producto}
              onChange={e => {
                const p = productos.find(x => x._id === e.target.value);
                setForm({ ...form, producto: e.target.value, unidad: p?.unidad || 'pieza' });
              }}>
              <option value="">Selecciona un insumo</option>
              {productos.map(p => (
                <option key={p._id} value={p._id}>{p.nombre} ({p.unidad})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Cantidad *</label>
              <input className="form-input" type="number" min="1" value={form.cantidad}
                onChange={e => setForm({ ...form, cantidad: parseInt(e.target.value) || 1 })} />
            </div>
            <div className="form-group">
              <label className="form-label">Unidad</label>
              <input className="form-input" value={form.unidad}
                onChange={e => setForm({ ...form, unidad: e.target.value })} />
            </div>
          </div>

          <h3 style={{ color: 'var(--amarillo)', margin: '1.5rem 0 1.25rem', fontSize: '1.1rem' }}>
            🚚 Modalidad
          </h3>

          <div className="form-group">
            <label className="form-label">¿Cómo entregas? *</label>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {[
                { value: 'recoleccion', label: '🚚 Pasamos a recoger' },
                { value: 'entrega', label: '📦 Yo entrego en el centro' },
              ].map(t => (
                <button key={t.value} type="button"
                  className={`btn btn-sm ${form.tipoDonacion === t.value ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setForm({ ...form, tipoDonacion: t.value })}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <h3 style={{ color: 'var(--amarillo)', margin: '1.5rem 0 1.25rem', fontSize: '1.1rem' }}>
            📅 ¿Cuándo?
          </h3>

          <div className="form-group">
            <label className="form-label">Fecha *</label>
            <input className="form-input" type="date" min={hoy} value={form.fecha}
              onChange={e => setForm({ ...form, fecha: e.target.value, hora: '' })} />
          </div>

          {form.fecha && (
            <div className="form-group">
              <label className="form-label">Hora *</label>
              <div className="horarios-grid">
                {HORARIOS.map(h => (
                  <button key={h} type="button"
                    className={`hora-btn ${form.hora === h ? 'selected' : ''}`}
                    onClick={() => setForm({ ...form, hora: h })}>
                    {h}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Dirección (opcional)</label>
            <input className="form-input" value={form.direccion}
              onChange={e => setForm({ ...form, direccion: e.target.value })}
              placeholder="Calle, número, colonia" />
          </div>

          <div className="form-group">
            <label className="form-label">Notas adicionales (opcional)</label>
            <textarea className="form-input" rows={3} value={form.notas}
              onChange={e => setForm({ ...form, notas: e.target.value })}
              placeholder="¿Algo que debamos saber?" style={{ resize: 'vertical' }} />
          </div>

          <button className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}
            onClick={handleSubmit} disabled={cargando}>
            {cargando ? 'Enviando...' : '✓ Registrar Donación'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuieroDonar;