import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTodosPedidos, actualizarPedido } from '../services/api';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import api from '../services/api';
import toast from 'react-hot-toast';

const ESTADOS = ['', 'pendiente', 'confirmada', 'en_proceso', 'completada', 'cancelada'];

/* ─── Exportar a CSV (abre en Excel) ─── */
const exportarExcel = (pedidos, getNombre, getTelefono, getEmpresa) => {
  const filas = [
    ['Cliente', 'Teléfono', 'Empresa', 'Servicio', 'Fecha', 'Hora', 'Dirección', 'Estado', 'Notas Admin'],
    ...pedidos.map(p => [
      getNombre(p),
      getTelefono(p),
      getEmpresa(p),
      p.servicio?.nombre || '',
      new Date(p.fecha).toLocaleDateString('es-MX'),
      p.hora,
      p.direccion || '',
      p.estado,
      p.notasAdmin || ''
    ])
  ];
  const csv = filas.map(f => f.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pedidos_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success('Archivo descargado');
};

/* ─── Modal progreso ─── */
const ModalProgreso = ({ pedido, onCerrar, onActualizar }) => {
  const completada = pedido.estado === 'completada' || pedido.estado === 'cancelada';
  const completados = pedido.progreso?.filter(p => p.completado).length || 0;
  const total = pedido.progreso?.length || 5;
  const porcentaje = Math.round((completados / total) * 100);
  const siguientePaso = pedido.progreso?.findIndex(p => !p.completado);
  const getNombre = (c) => c.nombre ? `${c.nombre} ${c.apellidoPaterno}` : c.cliente?.nombre || 'Sin nombre';

  const marcarListo = async (index) => {
    try {
      await api.put(`/api/admin/pedidos/${pedido._id}/progreso`, { pasoIndex: index, completado: true, notas: '' });
      toast.success('✅ Paso completado');
      onActualizar(pedido._id);
    } catch { toast.error('Error al actualizar paso'); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '520px', maxHeight: '88vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ color: 'var(--amarillo)', fontSize: '1.3rem' }}>Seguimiento del Trabajo</h3>
          <button className="btn btn-secondary btn-sm" onClick={onCerrar}>Cerrar</button>
        </div>
        <div style={{ padding: '0.75rem 1rem', background: 'var(--gris-medio)', borderRadius: '4px', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
          <div style={{ fontWeight: 700, color: 'var(--amarillo)' }}>{getNombre(pedido)}</div>
          <div style={{ color: 'var(--blanco-apagado)' }}>{pedido.servicio?.nombre}</div>
          {pedido.direccion && <div style={{ color: 'var(--blanco-apagado)', fontSize: '0.82rem' }}>Dirección: {pedido.direccion}</div>}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: '0.85rem', color: 'var(--blanco-apagado)', textTransform: 'uppercase', letterSpacing: '1px' }}>Avance general</span>
            <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: '1.2rem', color: porcentaje === 100 ? 'var(--verde)' : 'var(--amarillo)' }}>{porcentaje}%</span>
          </div>
          <div style={{ height: '10px', background: 'var(--gris-medio)', borderRadius: '5px', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: '5px', transition: 'width 0.5s ease', width: `${porcentaje}%`, background: porcentaje === 100 ? 'var(--verde)' : 'linear-gradient(90deg, var(--amarillo), var(--amarillo-oscuro))' }} />
          </div>
          <div style={{ textAlign: 'center', marginTop: '0.4rem', fontSize: '0.82rem', color: 'var(--blanco-apagado)' }}>{completados} de {total} pasos completados</div>
        </div>

        {completada ? (
          pedido.estado === 'cancelada' ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'rgba(229,62,62,0.1)', borderRadius: '8px', border: '2px solid #e53e3e' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🚫</div>
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: '1.5rem', fontWeight: 800, color: '#e53e3e', textTransform: 'uppercase' }}>Pedido Cancelado</div>
              <div style={{ color: 'var(--blanco-apagado)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Este pedido fue cancelado</div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'rgba(45,198,83,0.1)', borderRadius: '8px', border: '2px solid var(--verde)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>Trabajo Terminado</div>
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: '1.5rem', fontWeight: 800, color: 'var(--verde)', textTransform: 'uppercase' }}>Pedido Completado</div>
              <div style={{ color: 'var(--blanco-apagado)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Este pedido fue completado exitosamente</div>
            </div>
          )
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pedido.progreso?.map((paso, i) => {
              const esActual = i === siguientePaso;
              const esFuturo = i > siguientePaso;
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '6px',
                  background: paso.completado ? 'rgba(45,198,83,0.08)' : esActual ? 'rgba(245,197,24,0.08)' : 'var(--gris-medio)',
                  border: `2px solid ${paso.completado ? 'var(--verde)' : esActual ? 'var(--amarillo)' : 'transparent'}`,
                  opacity: esFuturo ? 0.45 : 1, transition: 'all 0.3s'
                }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: '1rem',
                    background: paso.completado ? 'var(--verde)' : esActual ? 'var(--amarillo)' : 'var(--gris-claro)',
                    color: paso.completado ? 'white' : esActual ? 'var(--negro)' : 'var(--blanco-apagado)'
                  }}>{paso.completado ? '✓' : i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: paso.completado ? 'var(--verde)' : esActual ? 'var(--amarillo)' : 'var(--blanco-apagado)', textDecoration: paso.completado ? 'line-through' : 'none' }}>
                      {paso.titulo}
                    </div>
                    {paso.completado && paso.fecha && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--verde)', marginTop: '0.2rem' }}>
                        Completado: {new Date(paso.fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                    {esActual && <div style={{ fontSize: '0.8rem', color: 'var(--amarillo)', marginTop: '0.2rem' }}>Paso actual</div>}
                  </div>
                  {esActual && (
                    <button className="btn btn-sm" style={{ background: 'var(--verde)', color: 'white', flexShrink: 0, fontSize: '1rem', padding: '0.5rem 1.2rem' }} onClick={() => marcarListo(i)}>
                      Listo
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Página principal ─── */
const AdminPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [pedidoEditando, setPedidoEditando] = useState(null);
  const [pedidoProgreso, setPedidoProgreso] = useState(null);
  const [formEdit, setFormEdit] = useState({ estado: '', notasAdmin: '' });
  const { usuario } = useAuth();

  const cargar = () => {
    setCargando(true);
    getTodosPedidos({ estado: filtroEstado || undefined })
      .then(setPedidos)
      .catch(() => toast.error('Error al cargar pedidos'))
      .finally(() => setCargando(false));
  };

  const recargarPedido = async (id) => {
    const res = await api.get('/api/admin/pedidos');
    const actualizada = res.data.find(c => c._id === id);
    if (actualizada) setPedidoProgreso(actualizada);
    setPedidos(res.data);
  };

  useEffect(() => { cargar(); }, [filtroEstado]);

  const guardarEdicion = async () => {
    try {
      await actualizarPedido(pedidoEditando._id, formEdit);
      toast.success('Pedido actualizado');
      setPedidoEditando(null);
      cargar();
    } catch { toast.error('Error al actualizar'); }
  };

  const marcarCompletada = async (p) => {
    if (!window.confirm(`¿Marcar como completado el pedido de ${getNombre(p)}?`)) return;
    try {
      await actualizarPedido(p._id, { estado: 'completada', notasAdmin: p.notasAdmin || '' });
      toast.success('Pedido completado!');
      cargar();
    } catch { toast.error('Error al actualizar'); }
  };

  const cancelarPedido = async (p) => {
    if (!window.confirm(`¿Cancelar el pedido de ${getNombre(p)}? Esta acción no se puede deshacer.`)) return;
    try {
      await actualizarPedido(p._id, { estado: 'cancelada', notasAdmin: p.notasAdmin || '' });
      toast.success('Pedido cancelado');
      cargar();
    } catch { toast.error('Error al cancelar pedido'); }
  };

  const getNombre   = (c) => c.nombre ? `${c.nombre} ${c.apellidoPaterno}` : c.cliente?.nombre || 'Sin nombre';
  const getTelefono = (c) => c.telefono || c.cliente?.telefono || '-';
  const getEmpresa  = (c) => c.empresa || c.cliente?.empresa || '';
  const formatFecha = (f) => new Date(f).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
  const colorEstado = { pendiente: 'badge-pendiente', confirmada: 'badge-confirmada', en_proceso: 'badge-pendiente', completada: 'badge-completada', cancelada: 'badge-cancelada' };

  /* ─── Filtros en el cliente ─── */
  const pedidosFiltrados = pedidos.filter(p => {
    const nombre = getNombre(p).toLowerCase();
    const tel    = getTelefono(p);
    const matchBusqueda = !busqueda || nombre.includes(busqueda.toLowerCase()) || tel.includes(busqueda);
    const fecha  = new Date(p.fecha);
    const matchDesde = !fechaDesde || fecha >= new Date(fechaDesde);
    const matchHasta = !fechaHasta || fecha <= new Date(fechaHasta + 'T23:59:59');
    return matchBusqueda && matchDesde && matchHasta;
  });

  const limpiarFiltros = () => { setBusqueda(''); setFechaDesde(''); setFechaHasta(''); setFiltroEstado(''); };

  return (
    <div className="container page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">Gestión de Pedidos</h1>
          <p className="page-subtitle">Administra y da seguimiento a todos los pedidos</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => exportarExcel(pedidosFiltrados, getNombre, getTelefono, getEmpresa)}>
            📥 Exportar Excel
          </button>
          {usuario?.rol === 'admin' && <Link to="/admin/agendar" className="btn btn-primary">+ Nuevo Pedido</Link>}
        </div>
      </div>

      {/* Filtros */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>

          {/* Busqueda */}
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--blanco-apagado)', display: 'block', marginBottom: '0.3rem' }}>🔍 Buscar</label>
            <input
              className="form-input"
              placeholder="Nombre o teléfono..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              style={{ margin: 0 }}
            />
          </div>

          {/* Fecha desde */}
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--blanco-apagado)', display: 'block', marginBottom: '0.3rem' }}>📅 Desde</label>
            <input type="date" className="form-input" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} style={{ margin: 0 }} />
          </div>

          {/* Fecha hasta */}
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--blanco-apagado)', display: 'block', marginBottom: '0.3rem' }}>📅 Hasta</label>
            <input type="date" className="form-input" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} style={{ margin: 0 }} />
          </div>

          {/* Limpiar */}
          <button className="btn btn-secondary btn-sm" onClick={limpiarFiltros}>✕ Limpiar</button>
        </div>

        {/* Filtros de estado */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
          {ESTADOS.map(e => (
            <button key={e} onClick={() => setFiltroEstado(e)} className={`btn btn-sm ${filtroEstado === e ? 'btn-primary' : 'btn-secondary'}`}>
              {e || 'Todos'}
            </button>
          ))}
        </div>
      </div>

      {/* Resultado */}
      <div style={{ fontSize: '0.85rem', color: 'var(--blanco-apagado)', marginBottom: '0.75rem' }}>
        Mostrando <strong style={{ color: 'var(--amarillo)' }}>{pedidosFiltrados.length}</strong> de {pedidos.length} pedidos
      </div>

      {cargando ? <div className="spinner" /> : pedidosFiltrados.length === 0 ? (
        <div className="empty-state"><div className="icon">📋</div><p>No hay pedidos con esos filtros</p></div>
      ) : (
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <table className="tabla">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Servicio</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Avance</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.map(c => {
                const comp = c.progreso?.filter(p => p.completado).length || 0;
                const tot  = c.progreso?.length || 5;
                const pct  = Math.round((comp / tot) * 100);
                return (
                  <tr key={c._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{getNombre(c)}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--blanco-apagado)' }}>{getTelefono(c)}</div>
                      {getEmpresa(c) && <div style={{ fontSize: '0.78rem', color: 'var(--amarillo)' }}>{getEmpresa(c)}</div>}
                    </td>
                    <td style={{ maxWidth: '150px', fontSize: '0.9rem' }}>{c.servicio?.nombre}</td>
                    <td>{formatFecha(c.fecha)}</td>
                    <td>{c.hora}</td>
                    <td style={{ minWidth: '110px' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--blanco-apagado)', marginBottom: '3px' }}>{comp}/{tot} pasos</div>
                      <div style={{ height: '6px', background: 'var(--gris-medio)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? 'var(--verde)' : 'var(--amarillo)', borderRadius: '3px', transition: 'width 0.3s' }} />
                      </div>
                      <div style={{ fontSize: '0.72rem', color: pct === 100 ? 'var(--verde)' : 'var(--amarillo)', marginTop: '2px' }}>{pct}%</div>
                    </td>
                    <td><span className={`badge ${colorEstado[c.estado] || 'badge-pendiente'}`}>{c.estado.replace('_', ' ')}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <button className="btn btn-sm" style={{ background: 'var(--azul)', color: 'white' }} onClick={() => setPedidoProgreso(c)}>
                          Progreso
                        </button>
                        {usuario?.rol === 'admin' && (c.estado === 'confirmada' || c.estado === 'pendiente' || c.estado === 'en_proceso') && (
                          <button className="btn btn-sm" style={{ background: 'var(--verde)', color: 'white' }} onClick={() => marcarCompletada(c)}>Completar</button>
                        )}
                        {usuario?.rol === 'admin' && c.estado !== 'cancelada' && c.estado !== 'completada' && (
                          <button className="btn btn-sm" style={{ background: '#e53e3e', color: 'white' }} onClick={() => cancelarPedido(c)}>Cancelar</button>
                        )}
                        {usuario?.rol === 'admin' && (
                          <button className="btn btn-secondary btn-sm" onClick={() => { setPedidoEditando(c); setFormEdit({ estado: c.estado, notasAdmin: c.notasAdmin || '' }); }}>Editar</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {pedidoProgreso && <ModalProgreso pedido={pedidoProgreso} onCerrar={() => setPedidoProgreso(null)} onActualizar={recargarPedido} />}

      {pedidoEditando && usuario?.rol === 'admin' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px' }}>
            <h3 style={{ color: 'var(--amarillo)', marginBottom: '1.25rem', fontSize: '1.4rem' }}>Actualizar Pedido</h3>
            <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'var(--gris-medio)', borderRadius: '4px', fontSize: '0.9rem' }}>
              <strong>{getNombre(pedidoEditando)}</strong> - {pedidoEditando.servicio?.nombre}
            </div>
            <div className="form-group">
              <label className="form-label">Estado</label>
              <select className="form-input" value={formEdit.estado} onChange={e => setFormEdit({ ...formEdit, estado: e.target.value })}>
                {ESTADOS.filter(Boolean).map(e => <option key={e} value={e}>{e.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Nota adicional</label>
              <textarea className="form-input" rows={3} value={formEdit.notasAdmin} onChange={e => setFormEdit({ ...formEdit, notasAdmin: e.target.value })} placeholder="Instrucciones..." style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setPedidoEditando(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={guardarEdicion}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPedidos;
