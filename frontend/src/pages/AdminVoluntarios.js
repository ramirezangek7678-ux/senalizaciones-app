import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AdminVoluntarios = () => {
  const [voluntarios, setVoluntarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ nombre: '', email: '', password: '', telefono: '' });

  const cargar = () => {
    api.get('/api/admin/voluntarios')
      .then(r => setVoluntarios(r.data))
      .catch(() => toast.error('Error al cargar voluntarios'))
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargar(); }, []);

  const handleCrear = async () => {
    if (!form.nombre || !form.email || !form.password || !form.telefono)
      return toast.error('Todos los campos son requeridos');
    if (form.password.length < 6)
      return toast.error('La contraseña debe tener al menos 6 caracteres');
    try {
      await api.post('/api/admin/voluntarios', form);
      toast.success('Voluntario creado exitosamente');
      setModal(false);
      setForm({ nombre: '', email: '', password: '', telefono: '' });
      cargar();
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al crear voluntario');
    }
  };

  const toggleActivo = async (vol) => {
    const accion = vol.activo ? 'desactivar' : 'activar';
    if (!window.confirm(`¿Deseas ${accion} a ${vol.nombre}?`)) return;
    try {
      await api.put(`/api/admin/voluntarios/${vol._id}`, { activo: !vol.activo });
      toast.success(`Voluntario ${vol.activo ? 'desactivado' : 'activado'}`);
      cargar();
    } catch {
      toast.error('Error al actualizar voluntario');
    }
  };

  return (
    <div className="container page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Voluntarios</h1>
          <p className="page-subtitle">Usuarios con acceso para ver y entregar donaciones</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ Nuevo Voluntario</button>
      </div>

      <div className="card card-amarillo" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--blanco-apagado)' }}>
          🤝 Los voluntarios pueden <strong style={{ color: 'var(--amarillo)' }}>ver todas las donaciones</strong> y <strong style={{ color: 'var(--amarillo)' }}>marcarlas como entregadas</strong>, pero no pueden registrar donaciones, editar insumos ni administrar el sistema.
        </p>
      </div>

      {cargando ? <div className="spinner" /> : (
        <div className="card" style={{ padding: 0 }}>
          <table className="tabla">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Estado</th>
                <th>Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {voluntarios.map(v => (
                <tr key={v._id}>
                  <td style={{ fontWeight: 600 }}>{v.nombre}</td>
                  <td style={{ color: 'var(--blanco-apagado)', fontSize: '0.9rem' }}>{v.email}</td>
                  <td>{v.telefono}</td>
                  <td>
                    <span className={`badge ${v.activo ? 'badge-confirmada' : 'badge-cancelada'}`}>
                      {v.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--blanco-apagado)' }}>
                    {new Date(v.createdAt).toLocaleDateString('es-MX')}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm"
                      style={{ background: v.activo ? 'var(--rojo)' : 'var(--verde)', color: 'white' }}
                      onClick={() => toggleActivo(v)}
                    >
                      {v.activo ? '⛔ Desactivar' : '✅ Activar'}
                    </button>
                  </td>
                </tr>
              ))}
              {voluntarios.length === 0 && (
                <tr><td colSpan={6}>
                  <div className="empty-state" style={{ padding: '2rem' }}>
                    <p>No hay voluntarios registrados aún</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '460px' }}>
            <h3 style={{ color: 'var(--amarillo)', marginBottom: '1.5rem', fontSize: '1.4rem' }}>
              🤝 Nuevo Voluntario
            </h3>
            <div className="form-group">
              <label className="form-label">Nombre Completo</label>
              <input className="form-input" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Juan Pérez" />
            </div>
            <div className="form-group">
              <label className="form-label">Correo Electrónico</label>
              <input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="voluntario@correo.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <input className="form-input" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} placeholder="477 123 4567" />
            </div>
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input className="form-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Mínimo 6 caracteres" />
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleCrear}>Crear Voluntario</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVoluntarios;