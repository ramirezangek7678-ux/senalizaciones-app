import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTodasDonaciones, actualizarDonacion } from '../services/api';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const ESTADOS = ['', 'pendiente', 'confirmada', 'en_camino', 'entregada', 'cancelada'];

const exportarExcel = (donaciones, getNombre, getTelefono, getOrganizacion) => {
  const filas = [
    ['Donante', 'Teléfono', 'Organización', 'Producto', 'Cantidad', 'Fecha', 'Hora', 'Dirección', 'Estado', 'Notas Admin'],
    ...donaciones.map(d => [
      getNombre(d),
      getTelefono(d),
      getOrganizacion(d),
      d.producto?.nombre || '',
      `${d.cantidad} ${d.unidad}`,
      new Date(d.fecha).toLocaleDateString('es-MX'),
      d.hora,
      d.direccion || '',
      d.estado,
      d.notasAdmin || ''
    ])
  ];
  const csv = filas.map(f => f.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `donaciones_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success('Archivo descargado');
};

const ModalProgreso = ({ donacion, onCerrar, onActualizar }) => {
  const completada = donacion.estado === 'entregada' || donacion.estado === 'cancelada';
  const completados = donacion.progreso?.filter(p => p.completado).length || 0;
  const total = donacion.progreso?.length || 5;
  const porcentaje = Math.round((completados / total) * 100);
  const siguientePaso = donacion.progreso?.findIndex(p => !p.completado);
  const getNombre = (d) => d.nombre ? `${d.nombre} ${d.apellidoPaterno}` : d.donante?.nombre || 'Sin nombre';

  const marcarListo = async (index) => {
    try {
      await api.put(`/api/admin/donaciones/${donacion._id}/progreso`, { pasoIndex: index, completado: true, notas: '' });
      toast.success('✅ Paso completado');
      onActualizar(donacion._id);
    } catch { toast.error('Error al actualizar paso'); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '520px', maxHeight: '88vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ color: 'var(--amarillo)', fontSize: '1.3rem' }}>Seguimiento de la Donación</h3>
          <button className="btn btn-secondary btn-sm" onClick={onCerrar}>Cerrar</button>
        </div>
        <div style={{ padding: '0.75rem 1rem', background: 'var(--gris-medio)', borderRadius: '4px', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
          <div style={{ fontWeight: 700, color: 'var(--amarillo)' }}>{getNombre(donacion)}</div>
          <div style={{ color: 'var(--blanco-apagado)' }}>{donacion.producto?.nombre} · {donacion.cantidad} {donacion.unidad}</div>
          {donacion.direccion && <div style={{ color: 'var(--blanco-apagado)', fontSize: '0.82rem' }}>Dirección: {donacion.direccion}</div>}
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
          donacion.estado === 'cancelada' ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'rgba(229,62,62,0.1)', borderRadius: '8px', border: '2px solid #e53e3e' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🚫</div>
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: '1.5rem', fontWeight: 800, color: '#e53e3e', textTransform: 'uppercase' }}>Donación Cancelada</div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'rgba(45,198,83,0.1)', borderRadius: '8px', border: '2px solid var(--verde)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>❤️</div>
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: '1.5rem', fontWeight: 800, color: 'var(--verde)', textTransform: 'uppercase' }}>Donación Entregada</div>
              <div style={{ color: 'var(--blanco-apagado)', fontSize: '0.9rem', marginTop: '0.5rem' }}>¡Gracias por tu solidaridad!</div>
            </div>
          )
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {donacion.progreso?.map((paso, i) => {
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

const AdminDonaciones = () => {
  const [donaciones, setDonaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [donacionEditando, setDonacionEditando] = useState(null);
  const [donacionProgreso, setDonacionProgreso] = useState(null);
  const [formEdit, setFormEdit] = useState({ estado: '', notasAdmin: '' });
  const { usuario } = useAuth();

  const cargar = () => {
    setCargando(true);
    getTodasDonaciones({ estado: filtroEstado || undefined })
      .then(setDonaciones)
      .catch(() => toast.error('Error al cargar donaciones'))
      .finally(() => setCargando(false));
  };

  const recargarDonacion = async (id) => {
    const res = await api.get('/api/admin/donaciones');
    const actualizada = res.data.find(c => c._id === id);
    if (actualizada) setDonacionProgreso(actualizada);
    setDonaciones(res.data);
  };

  useEffect(() => { cargar(); }, [filtroEstado]);

  const guardarEdicion = async () => {
    try {
      await actualizarDonacion(donacionEditando._id, formEdit);
      toast.success('Donación actualizada');
      setDonacionEditando(null);
      cargar();
    } catch { toast.error('Error al actualizar'); }
  };

  const marcarEntregada = async (d) => {
    if (!window.confirm(`¿Marcar como entregada la donación de ${getNombre(d)}?`)) return;
    try {
      await actualizarDonacion(d._id, { estado: 'entregada', notasAdmin: d.notasAdmin || '' });
      toast.success('Donación entregada!');
      cargar();
    } catch { toast.error('Error al actualizar'); }
  };

  const cancelarDonacion = async (d) => {
    if (!window.confirm(`¿Cancelar la donación de ${getNombre(d)}? Esta acción no se puede deshacer.`)) return;
    try {
      await actualizarDonacion(d._id, { estado: 'cancelada', notasAdmin: d.notasAdmin || '' });
      toast.success('Donación cancelada');
      cargar();
    } catch { toast.error('Error al cancelar'); }
  };

  const getNombre       = (d) => d.nombre ? `${d.nombre} ${d.apellidoPaterno}` : d.donante?.nombre || 'Sin nombre';
  const getTelefono     = (d) => d.telefono || d.donante?.telefono || '-';
  const getOrganizacion = (d) => d.organizacion || d.donante?.organizacion || '';
  const formatFecha     = (f) => new Date(f).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
  const colorEstado = { pendiente: 'badge-pendiente', confirmada: 'badge-confirmada', en_camino: 'badge-pendiente', entregada: 'badge-completada', cancelada: 'badge-cancelada' };

  const donacionesFiltradas = donaciones.filter(d => {
    const nombre = getNombre(d).toLowerCase();
    const tel    = getTelefono(d);
    const matchBusqueda = !busqueda || nombre.includes(busqueda.toLowerCase()) || tel.includes(busqueda);
    const fecha  = new Date(d.fecha);
    const matchDesde = !fechaDesde || fecha >= new Date(fechaDesde);
    const matchHasta = !fechaHasta || fecha <= new Date(fechaHasta + 'T23:59:59');
    return matchBusqueda && matchDesde && matchHasta;
  });

  const limpiarFiltros = () => { setBusqueda(''); setFechaDesde(''); setFechaHasta(''); setFiltroEstado(''); };

  return (
    <div className="container page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">Gestión de Donaciones</h1>
          <p className="page-subtitle">Administra y da seguimiento a todas las donaciones</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => exportarExcel(donacionesFiltradas, getNombre, getTelefono, getOrganizacion)}>
            📥 Exportar Excel
          </button>
          {usuario?.rol === 'admin' && <Link to="/admin/registrar" className="btn btn-primary">+ Nueva Donación</Link>}
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--blanco-apagado)', display: 'block', marginBottom: '0.3rem' }}>🔍 Buscar</label>
            <input className="form-input" placeholder="Nombre o teléfono..." value={busqueda} onChange={e => setBusqueda(e.target.value)} style={{ margin: 0 }} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--blanco-apagado)', display: 'block', marginBottom: '0.3rem' }}>📅 Desde</label>
            <input type="date" className="form-input" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} style={{ margin: 0 }} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--blanco-apagado)', display: 'block', marginBottom: '0.3rem' }}>📅 Hasta</label>
            <input type="date" className="form-input" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} style={{ margin: 0 }} />
          </div>
          <button className="btn btn-secondary btn-sm" onClick={limpiarFiltros}>✕ Limpiar</button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
          {ESTADOS.map(e => (
            <button key={e} onClick={() => setFiltroEstado(e)} className={`btn btn-sm ${filtroEstado === e ? 'btn-primary' : 'btn-secondary'}`}>
              {e.replace('_', ' ') || 'Todos'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ fontSize: '0.85rem', color: 'var(--blanco-apagado)', marginBottom: '0.75rem' }}>
        Mostrando <strong style={{ color: 'var(--amarillo)' }}>{donacionesFiltradas.length}</strong> de {donaciones.length} donaciones
      </div>

      {cargando ? <div className="spinner" /> : donacionesFiltradas.length === 0 ? (
        <div className="empty-state"><div className="icon">📦</div><p>No hay donaciones con esos filtros</p></div>
      ) : (
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <table className="tabla">
            <thead>
              <tr>
                <th>Nº Donación</th>
                <th>Donante</th>
                <th>Producto</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Avance</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {donacionesFiltradas.map(d => {
                const comp = d.progreso?.filter(p => p.completado).length || 0;
                const tot  = d.progreso?.length || 5;
                const pct  = Math.round((comp / tot) * 100);
                return (
                  <tr key={d._id}>
                    <td>
                      <div style={{ fontFamily: "Barlow Condensed", fontSize: "1.1rem", fontWeight: 800, color: "var(--amarillo)", letterSpacing: "1px" }}>{d.numeroDonacion || "-"}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{getNombre(d)}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--blanco-apagado)' }}>{getTelefono(d)}</div>
                      {getOrganizacion(d) && <div style={{ fontSize: '0.78rem', color: 'var(--amarillo)' }}>{getOrganizacion(d)}</div>}
                    </td>
                    <td style={{ maxWidth: '180px', fontSize: '0.9rem' }}>
                      <div>{d.producto?.nombre}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--blanco-apagado)' }}>{d.cantidad} {d.unidad}</div>
                    </td>
                    <td>{formatFecha(d.fecha)}</td>
                    <td>{d.hora}</td>
                    <td style={{ minWidth: '110px' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--blanco-apagado)', marginBottom: '3px' }}>{comp}/{tot} pasos</div>
                      <div style={{ height: '6px', background: 'var(--gris-medio)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? 'var(--verde)' : 'var(--amarillo)', borderRadius: '3px', transition: 'width 0.3s' }} />
                      </div>
                      <div style={{ fontSize: '0.72rem', color: pct === 100 ? 'var(--verde)' : 'var(--amarillo)', marginTop: '2px' }}>{pct}%</div>
                    </td>
                    <td><span className={`badge ${colorEstado[d.estado] || 'badge-pendiente'}`}>{d.estado.replace('_', ' ')}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <button className="btn btn-sm" style={{ background: 'var(--azul)', color: 'white' }} onClick={() => setDonacionProgreso(d)}>
                          Progreso
                        </button>
                        {usuario?.rol === 'admin' && (d.estado === 'confirmada' || d.estado === 'pendiente' || d.estado === 'en_camino') && (
                          <button className="btn btn-sm" style={{ background: 'var(--verde)', color: 'white' }} onClick={() => marcarEntregada(d)}>Entregar</button>
                        )}
                        {usuario?.rol === 'admin' && d.estado !== 'cancelada' && d.estado !== 'entregada' && (
                          <button className="btn btn-sm" style={{ background: '#e53e3e', color: 'white' }} onClick={() => cancelarDonacion(d)}>Cancelar</button>
                        )}
                        {usuario?.rol === 'admin' && (
                          <button className="btn btn-secondary btn-sm" onClick={() => { setDonacionEditando(d); setFormEdit({ estado: d.estado, notasAdmin: d.notasAdmin || '' }); }}>Editar</button>
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

      {donacionProgreso && <ModalProgreso donacion={donacionProgreso} onCerrar={() => setDonacionProgreso(null)} onActualizar={recargarDonacion} />}

      {donacionEditando && usuario?.rol === 'admin' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px' }}>
            <h3 style={{ color: 'var(--amarillo)', marginBottom: '1.25rem', fontSize: '1.4rem' }}>Actualizar Donación</h3>
            <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'var(--gris-medio)', borderRadius: '4px', fontSize: '0.9rem' }}>
              <strong>{getNombre(donacionEditando)}</strong> - {donacionEditando.producto?.nombre}
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
              <button className="btn btn-secondary" onClick={() => setDonacionEditando(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={guardarEdicion}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDonaciones;