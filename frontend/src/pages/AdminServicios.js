import React, { useState, useEffect } from 'react';
import { getServicios, crearServicio, actualizarServicio } from '../services/api';
import api from '../services/api';
import toast from 'react-hot-toast';

const CATEGORIAS = [
  { value: 'señalamientos_viales', label: 'Señalamientos Viales' },
  { value: 'señalamientos_industriales', label: 'Señalamientos Industriales' },
  { value: 'señalamientos_comerciales', label: 'Señalamientos Comerciales' },
  { value: 'consultoria', label: 'Consultoría' },
  { value: 'instalacion', label: 'Instalación' },
  { value: 'otro', label: 'Otro' },
];

const formVacio = { nombre: '', descripcion: '', duracionMinutos: 60, precio: '', categoria: 'señalamientos_viales', activo: true };

const AdminServicios = () => {
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(formVacio);
  const [filtro, setFiltro] = useState('activos');

  const cargar = async () => {
    try {
      // Traer todos incluyendo inactivos
      const res = await api.get('/api/servicios', { params: { todos: true } });
      setServicios(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Error al cargar servicios');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const serviciosFiltrados = servicios.filter(s =>
    filtro === 'activos' ? s.activo : filtro === 'inactivos' ? !s.activo : true
  );

  const abrirNuevo = () => { setEditando(null); setForm(formVacio); setModal(true); };
  const abrirEditar = (s) => { setEditando(s); setForm({ ...s }); setModal(true); };

  const handleGuardar = async () => {
    if (!form.nombre || !form.precio) return toast.error('Nombre y precio son requeridos');
    try {
      if (editando) {
        await actualizarServicio(editando._id, form);
        toast.success('Servicio actualizado');
      } else {
        await crearServicio(form);
        toast.success('Servicio creado');
      }
      setModal(false);
      cargar();
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al guardar servicio');
    }
  };

  const toggleActivo = async (s) => {
    const accion = s.activo ? 'inactivar' : 'activar';
    if (!window.confirm(`¿Deseas ${accion} el servicio "${s.nombre}"?`)) return;
    try {
      await actualizarServicio(s._id, { ...s, activo: !s.activo });
      toast.success(`Servicio ${s.activo ? 'inactivado' : 'activado'} correctamente`);
      cargar();
    } catch {
      toast.error('Error al actualizar servicio');
    }
  };

  return (
    <div className="container page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Catálogo de Servicios</h1>
          <p className="page-subtitle">Gestiona los servicios disponibles</p>
        </div>
        <button className="btn btn-primary" onClick={abrirNuevo}>+ Nuevo Servicio</button>
      </div>

      {/* Filtro activos/inactivos */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { value: 'activos', label: '✅ Activos' },
          { value: 'inactivos', label: '⛔ Inactivos' },
          { value: 'todos', label: 'Todos' },
        ].map(f => (
          <button key={f.value} onClick={() => setFiltro(f.value)}
            className={`btn btn-sm ${filtro === f.value ? 'btn-primary' : 'btn-secondary'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {cargando ? <div className="spinner" /> : (
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <table className="tabla">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Duración</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {serviciosFiltrados.map(s => (
                <tr key={s._id} style={{ opacity: s.activo ? 1 : 0.5 }}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{s.nombre}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--blanco-apagado)' }}>{s.descripcion.slice(0, 55)}...</div>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{s.categoria.replace(/_/g, ' ')}</td>
                  <td style={{ color: 'var(--amarillo)', fontWeight: 700 }}>${s.precio.toLocaleString()}</td>
                  <td>{s.duracionMinutos} min</td>
                  <td>
                    <span className={`badge ${s.activo ? 'badge-confirmada' : 'badge-cancelada'}`}>
                      {s.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => abrirEditar(s)}>
                        Editar
                      </button>
                      <button
                        className="btn btn-sm"
                        style={{ background: s.activo ? 'var(--rojo)' : 'var(--verde)', color: 'white' }}
                        onClick={() => toggleActivo(s)}
                      >
                        {s.activo ? '⛔ Inactivar' : '✅ Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {serviciosFiltrados.length === 0 && (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <p>No hay servicios {filtro === 'activos' ? 'activos' : filtro === 'inactivos' ? 'inactivos' : ''}</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ color: 'var(--amarillo)', marginBottom: '1.5rem', fontSize: '1.4rem' }}>
              {editando ? 'Editar Servicio' : 'Nuevo Servicio'}
            </h3>
            <div className="form-group">
              <label className="form-label">Nombre del Servicio</label>
              <input className="form-input" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Instalación de señales viales" />
            </div>
            <div className="form-group">
              <label className="form-label">Descripción</label>
              <textarea className="form-input" rows={3} value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} placeholder="Describe el servicio..." style={{ resize: 'vertical' }} />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Precio (MXN)</label>
                <input className="form-input" type="number" value={form.precio} onChange={e => setForm({ ...form, precio: e.target.value })} placeholder="0.00" />
              </div>
              <div className="form-group">
                <label className="form-label">Duración (minutos)</label>
                <input className="form-input" type="number" value={form.duracionMinutos} onChange={e => setForm({ ...form, duracionMinutos: parseInt(e.target.value) })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Categoría</label>
              <select className="form-input" value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}>
                {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleGuardar}>
                {editando ? 'Guardar Cambios' : 'Crear Servicio'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServicios;
