import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AdminEmpleados = () => {
  const [empleados, setEmpleados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ nombre: '', email: '', password: '', telefono: '' });

  const cargar = () => {
    api.get('/api/admin/empleados')
      .then(r => setEmpleados(Array.isArray(r.data) ? r.data : []))
      .catch(() => toast.error('Error al cargar empleados'))
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargar(); }, []);

  const handleCrear = async () => {
    if (!form.nombre || !form.email || !form.password || !form.telefono)
      return toast.error('Todos los campos son requeridos');
    if (form.password.length < 6)
      return toast.error('La contraseña debe tener al menos 6 caracteres');
    try {
      await api.post('/api/admin/empleados', form);
      toast.success('Empleado creado exitosamente');
      setModal(false);
      setForm({ nombre: '', email: '', password: '', telefono: '' });
      cargar();
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al crear empleado');
    }
  };

  const toggleActivo = async (emp) => {
    const accion = emp.activo ? 'desactivar' : 'activar';
    if (!window.confirm(`¿Deseas ${accion} a ${emp.nombre}?`)) return;
    try {
      await api.put(`/api/admin/empleados/${emp._id}`, { activo: !emp.activo });
      toast.success(`Empleado ${emp.activo ? 'desactivado' : 'activado'}`);
      cargar();
    } catch {
      toast.error('Error al actualizar empleado');
    }
  };

  return (
    <div className="container page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Empleados</h1>
          <p className="page-subtitle">Usuarios con acceso para ver y completar pedidos</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ Nuevo Empleado</button>
      </div>

      {/* Info del rol */}
      <div className="card card-amarillo" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--blanco-apagado)' }}>
          👷 Los empleados pueden <strong style={{ color: 'var(--amarillo)' }}>ver todos los pedidos</strong> y <strong style={{ color: 'var(--amarillo)' }}>marcarlos como completados</strong>, pero no pueden agendar, editar servicios ni administrar el sistema.
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
              {empleados.map(e => (
                <tr key={e._id}>
                  <td style={{ fontWeight: 600 }}>{e.nombre}</td>
                  <td style={{ color: 'var(--blanco-apagado)', fontSize: '0.9rem' }}>{e.email}</td>
                  <td>{e.telefono}</td>
                  <td>
                    <span className={`badge ${e.activo ? 'badge-confirmada' : 'badge-cancelada'}`}>
                      {e.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--blanco-apagado)' }}>
                    {new Date(e.createdAt).toLocaleDateString('es-MX')}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm"
                      style={{ background: e.activo ? 'var(--rojo)' : 'var(--verde)', color: 'white' }}
                      onClick={() => toggleActivo(e)}
                    >
                      {e.activo ? '⛔ Desactivar' : '✅ Activar'}
                    </button>
                  </td>
                </tr>
              ))}
              {empleados.length === 0 && (
                <tr><td colSpan={6}>
                  <div className="empty-state" style={{ padding: '2rem' }}>
                    <p>No hay empleados registrados aún</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal crear empleado */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '460px' }}>
            <h3 style={{ color: 'var(--amarillo)', marginBottom: '1.5rem', fontSize: '1.4rem' }}>
              👷 Nuevo Empleado
            </h3>
            <div className="form-group">
              <label className="form-label">Nombre Completo</label>
              <input className="form-input" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Juan Pérez" />
            </div>
            <div className="form-group">
              <label className="form-label">Correo Electrónico</label>
              <input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="empleado@empresa.com" />
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
              <button className="btn btn-primary" onClick={handleCrear}>Crear Empleado</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmpleados;
