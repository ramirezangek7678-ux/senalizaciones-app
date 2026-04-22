import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AREAS = [
  { value: 'instalacion', label: 'Instalación' },
  { value: 'ventas', label: 'Ventas' },
  { value: 'diseño', label: 'Diseño' },
  { value: 'administracion', label: 'Administración' },
  { value: 'otro', label: 'Otro' },
];

const formVacio = {
  nombre: '', apellidoPaterno: '', apellidoMaterno: '',
  telefono: '', email: '', puesto: '', area: 'instalacion',
  numeroEmpleado: '', fechaIngreso: '', notas: '',
  crearAcceso: false, password: ''
};

const AdminTrabajadores = () => {
  const [trabajadores, setTrabajadores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(formVacio);
  const [filtro, setFiltro] = useState('activos');
  const [busqueda, setBusqueda] = useState('');

  const cargar = () => {
    api.get('/api/trabajadores')
      .then(r => { const data = r.data; setTrabajadores(Array.isArray(data) ? data : []); })
      .catch(() => toast.error('Error al cargar trabajadores'))
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargar(); }, []);

  const trabajadoresFiltrados = trabajadores
    .filter(t => filtro === 'activos' ? t.activo : filtro === 'inactivos' ? !t.activo : true)
    .filter(t => {
      const texto = busqueda.toLowerCase();
      return (
        t.nombre.toLowerCase().includes(texto) ||
        t.apellidoPaterno.toLowerCase().includes(texto) ||
        t.puesto.toLowerCase().includes(texto) ||
        (t.numeroEmpleado && t.numeroEmpleado.toLowerCase().includes(texto))
      );
    });

  const abrirNuevo = () => { setEditando(null); setForm(formVacio); setModal(true); };
  const abrirEditar = (t) => {
    setEditando(t);
    setForm({ ...t, fechaIngreso: t.fechaIngreso ? new Date(t.fechaIngreso).toISOString().split('T')[0] : '', crearAcceso: false, password: '' });
    setModal(true);
  };

  const handleGuardar = async () => {
    if (!form.nombre || !form.apellidoPaterno || !form.telefono || !form.puesto)
      return toast.error('Nombre, apellido paterno, teléfono y puesto son requeridos');
    if (form.crearAcceso && !form.email)
      return toast.error('El email es requerido para crear acceso al sistema');
    if (form.crearAcceso && form.password.length < 6)
      return toast.error('La contraseña debe tener al menos 6 caracteres');

    try {
      if (editando) {
        await api.put(`/api/trabajadores/${editando._id}`, form);
        toast.success('Trabajador actualizado');
      } else {
        await api.post('/api/trabajadores', form);
        toast.success('Trabajador registrado');
      }

      // Si se marcó crear acceso, crear empleado en el sistema
      if (form.crearAcceso && form.email && form.password) {
        try {
          await api.post('/api/admin/empleados', {
            nombre: `${form.nombre} ${form.apellidoPaterno}`,
            email: form.email,
            password: form.password,
            telefono: form.telefono
          });
          toast.success(`✅ Acceso al sistema creado para ${form.nombre}`);
        } catch (err) {
          toast.error(err.response?.data?.mensaje || 'El trabajador se guardó pero hubo un error al crear el acceso');
        }
      }

      setModal(false);
      cargar();
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al guardar');
    }
  };

  const toggleActivo = async (t) => {
    const accion = t.activo ? 'dar de baja' : 'reactivar';
    if (!window.confirm(`¿Deseas ${accion} a ${t.nombre} ${t.apellidoPaterno}?`)) return;
    try {
      await api.put(`/api/trabajadores/${t._id}`, { activo: !t.activo });
      toast.success(`Trabajador ${t.activo ? 'dado de baja' : 'reactivado'}`);
      cargar();
    } catch {
      toast.error('Error al actualizar trabajador');
    }
  };

  const etiquetaArea = (area) => AREAS.find(a => a.value === area)?.label || area;

  return (
    <div className="container page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Trabajadores</h1>
          <p className="page-subtitle">{trabajadores.filter(t => t.activo).length} trabajadores activos</p>
        </div>
        <button className="btn btn-primary" onClick={abrirNuevo}>+ Nuevo Trabajador</button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[
            { value: 'activos', label: '✅ Activos' },
            { value: 'inactivos', label: '⛔ Baja' },
            { value: 'todos', label: 'Todos' },
          ].map(f => (
            <button key={f.value} onClick={() => setFiltro(f.value)}
              className={`btn btn-sm ${filtro === f.value ? 'btn-primary' : 'btn-secondary'}`}>
              {f.label}
            </button>
          ))}
        </div>
        <input className="form-input" style={{ maxWidth: '280px', padding: '0.5rem 1rem' }}
          value={busqueda} onChange={e => setBusqueda(e.target.value)}
          placeholder="🔍 Buscar por nombre o puesto..." />
      </div>

      {cargando ? <div className="spinner" /> : (
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <table className="tabla">
            <thead>
              <tr>
                <th>No. Emp</th>
                <th>Nombre Completo</th>
                <th>Puesto</th>
                <th>Área</th>
                <th>Teléfono</th>
                <th>Ingreso</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {trabajadoresFiltrados.map(t => (
                <tr key={t._id} style={{ opacity: t.activo ? 1 : 0.5 }}>
                  <td style={{ color: 'var(--amarillo)', fontWeight: 700 }}>{t.numeroEmpleado || '—'}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{t.nombre} {t.apellidoPaterno} {t.apellidoMaterno}</div>
                    {t.email && <div style={{ fontSize: '0.8rem', color: 'var(--blanco-apagado)' }}>{t.email}</div>}
                  </td>
                  <td>{t.puesto}</td>
                  <td style={{ fontSize: '0.85rem' }}>{etiquetaArea(t.area)}</td>
                  <td>{t.telefono}</td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--blanco-apagado)' }}>
                    {t.fechaIngreso ? new Date(t.fechaIngreso).toLocaleDateString('es-MX') : '—'}
                  </td>
                  <td>
                    <span className={`badge ${t.activo ? 'badge-confirmada' : 'badge-cancelada'}`}>
                      {t.activo ? 'Activo' : 'Baja'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => abrirEditar(t)}>Editar</button>
                      <button className="btn btn-sm"
                        style={{ background: t.activo ? '#e53e3e' : 'var(--verde)', color: 'white' }}
                        onClick={() => toggleActivo(t)}>
                        {t.activo ? 'Baja' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {trabajadoresFiltrados.length === 0 && (
                <tr><td colSpan={8}>
                  <div className="empty-state" style={{ padding: '2rem' }}>
                    <div className="icon">👷</div>
                    <p>No hay trabajadores registrados</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ color: 'var(--amarillo)', marginBottom: '1.5rem', fontSize: '1.4rem' }}>
              👷 {editando ? 'Editar Trabajador' : 'Nuevo Trabajador'}
            </h3>

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

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Teléfono *</label>
                <input className="form-input" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} placeholder="477 123 4567" />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="trabajador@empresa.com" />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Puesto *</label>
                <input className="form-input" value={form.puesto} onChange={e => setForm({ ...form, puesto: e.target.value })} placeholder="Técnico Instalador" />
              </div>
              <div className="form-group">
                <label className="form-label">Área</label>
                <select className="form-input" value={form.area} onChange={e => setForm({ ...form, area: e.target.value })}>
                  {AREAS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">No. Empleado</label>
                <input className="form-input" value={form.numeroEmpleado} onChange={e => setForm({ ...form, numeroEmpleado: e.target.value })} placeholder="EMP-001" />
              </div>
              <div className="form-group">
                <label className="form-label">Fecha de Ingreso</label>
                <input className="form-input" type="date" value={form.fechaIngreso} onChange={e => setForm({ ...form, fechaIngreso: e.target.value })} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Notas</label>
              <textarea className="form-input" rows={2} value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} placeholder="Observaciones del trabajador..." style={{ resize: 'vertical' }} />
            </div>

            {/* Sección acceso al sistema */}
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(245,197,24,0.06)', borderRadius: '6px', border: '1px solid rgba(245,197,24,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: form.crearAcceso ? '1rem' : 0 }}>
                <input
                  type="checkbox"
                  id="crearAcceso"
                  checked={form.crearAcceso}
                  onChange={e => setForm({ ...form, crearAcceso: e.target.checked, password: '' })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="crearAcceso" style={{ cursor: 'pointer', fontWeight: 600, color: 'var(--amarillo)' }}>
                  🔐 Dar acceso al sistema para ver pedidos
                </label>
              </div>
              {form.crearAcceso && (
                <div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--blanco-apagado)', marginBottom: '0.75rem' }}>
                    El empleado podrá iniciar sesión con el email de arriba y esta contraseña.
                  </p>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Contraseña *</label>
                    <input
                      className="form-input"
                      type="password"
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleGuardar}>
                {editando ? 'Guardar Cambios' : 'Registrar Trabajador'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTrabajadores;
