import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const CATEGORIAS = [
  { value: 'alimentos', label: 'Alimentos' },
  { value: 'ropa', label: 'Ropa' },
  { value: 'medicamentos', label: 'Medicamentos' },
  { value: 'juguetes', label: 'Juguetes' },
  { value: 'higiene', label: 'Higiene' },
  { value: 'escolar', label: 'Útiles escolares' },
  { value: 'otro', label: 'Otro' },
];

const formVacio = { nombre: '', descripcion: '', unidad: 'pieza', categoria: 'alimentos', meta: 0, activo: true };

const AdminProductos = () => {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(formVacio);
  const [filtro, setFiltro] = useState('activos');

  const cargar = async () => {
    try {
      const res = await api.get('/api/productos', { params: { todos: true } });
      setProductos(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Error al cargar productos');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const productosFiltrados = productos.filter(p =>
    filtro === 'activos' ? p.activo : filtro === 'inactivos' ? !p.activo : true
  );

  const abrirNuevo = () => { setEditando(null); setForm(formVacio); setModal(true); };
  const abrirEditar = (p) => { setEditando(p); setForm({ ...p }); setModal(true); };

  const handleGuardar = async () => {
    if (!form.nombre) return toast.error('Nombre es requerido');
    try {
      if (editando) {
        await api.put('/api/productos/' + editando._id, form);
        toast.success('Producto actualizado');
      } else {
        await api.post('/api/productos', form);
        toast.success('Producto creado');
      }
      setModal(false);
      cargar();
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al guardar producto');
    }
  };

  const toggleActivo = async (p) => {
    const accion = p.activo ? 'inactivar' : 'activar';
    if (!window.confirm(`¿Deseas ${accion} el producto "${p.nombre}"?`)) return;
    try {
      await api.put('/api/productos/' + p._id, { ...p, activo: !p.activo });
      toast.success(`Producto ${p.activo ? 'inactivado' : 'activado'} correctamente`);
      cargar();
    } catch {
      toast.error('Error al actualizar producto');
    }
  };

  return (
    <div className="container page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Catálogo de Insumos</h1>
          <p className="page-subtitle">Gestiona los insumos que la red necesita</p>
        </div>
        <button className="btn btn-primary" onClick={abrirNuevo}>+ Nuevo Insumo</button>
      </div>

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
                <th>Unidad</th>
                <th>Meta</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map(p => (
                <tr key={p._id} style={{ opacity: p.activo ? 1 : 0.5 }}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.nombre}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--blanco-apagado)' }}>{p.descripcion.slice(0, 55)}...</div>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{p.categoria.replace(/_/g, ' ')}</td>
                  <td>{p.unidad}</td>
                  <td style={{ color: 'var(--amarillo)', fontWeight: 700 }}>{p.meta || '—'}</td>
                  <td>
                    <span className={`badge ${p.activo ? 'badge-confirmada' : 'badge-cancelada'}`}>
                      {p.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => abrirEditar(p)}>Editar</button>
                      <button className="btn btn-sm"
                        style={{ background: p.activo ? 'var(--rojo)' : 'var(--verde)', color: 'white' }}
                        onClick={() => toggleActivo(p)}>
                        {p.activo ? '⛔ Inactivar' : '✅ Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {productosFiltrados.length === 0 && (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <p>No hay insumos {filtro === 'activos' ? 'activos' : filtro === 'inactivos' ? 'inactivos' : ''}</p>
            </div>
          )}
        </div>
      )}

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ color: 'var(--amarillo)', marginBottom: '1.5rem', fontSize: '1.4rem' }}>
              {editando ? 'Editar Insumo' : 'Nuevo Insumo'}
            </h3>
            <div className="form-group">
              <label className="form-label">Nombre del Insumo</label>
              <input className="form-input" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Alimentos no perecederos" />
            </div>
            <div className="form-group">
              <label className="form-label">Descripción</label>
              <textarea className="form-input" rows={3} value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} placeholder="Describe el insumo..." style={{ resize: 'vertical' }} />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Unidad</label>
                <input className="form-input" value={form.unidad} onChange={e => setForm({ ...form, unidad: e.target.value })} placeholder="kg, pieza, caja..." />
              </div>
              <div className="form-group">
                <label className="form-label">Meta (opcional)</label>
                <input className="form-input" type="number" value={form.meta} onChange={e => setForm({ ...form, meta: parseInt(e.target.value) || 0 })} placeholder="0" />
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
                {editando ? 'Guardar Cambios' : 'Crear Insumo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductos;