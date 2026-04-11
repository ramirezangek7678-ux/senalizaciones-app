import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTodasCitas, actualizarCita } from '../services/api';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const ESTADOS = ['', 'pendiente', 'confirmada', 'en_proceso', 'completada', 'cancelada'];

const ModalProgreso = ({ cita, onCerrar, onActualizar }) => {
  const completada = cita.estado === 'completada' || cita.estado === 'cancelada';
  const completados = cita.progreso?.filter(p => p.completado).length || 0;
  const total = cita.progreso?.length || 5;
  const porcentaje = Math.round((completados / total) * 100);
  const siguientePaso = cita.progreso?.findIndex(p => !p.completado);
  const getNombre = (c) => c.nombre ? `${c.nombre} ${c.apellidoPaterno}` : c.cliente?.nombre || 'Sin nombre';

  const marcarListo = async (index) => {
    try {
      await axios.put(`/api/admin/citas/${cita._id}/progreso`, { pasoIndex: index, completado: true, notas: '' });
      toast.success('✅ Paso completado');
      onActualizar(cita._id);
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
          <div style={{ fontWeight: 700, color: 'var(--amarillo)' }}>{getNombre(cita)}</div>
          <div style={{ color: 'var(--blanco-apagado)' }}>{cita.servicio?.nombre}</div>
          {cita.direccion && <div style={{ color: 'var(--blanco-apagado)', fontSize: '0.82rem' }}>Direccion: {cita.direccion}</div>}
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
          <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'rgba(45,198,83,0.1)', borderRadius: '8px', border: '2px solid var(--verde)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>Trabajo Terminado</div>
            <div style={{ fontFamily: 'Barlow Condensed', fontSize: '1.5rem', fontWeight: 800, color: 'var(--verde)', textTransform: 'uppercase' }}>Cita Completada</div>
            <div style={{ color: 'var(--blanco-apagado)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Esta cita fue completada exitosamente</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {cita.progreso?.map((paso, i) => {
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

const AdminCitas = () => {
  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [citaEditando, setCitaEditando] = useState(null);
  const [citaProgreso, setCitaProgreso] = useState(null);
  const [formEdit, setFormEdit] = useState({ estado: '', notasAdmin: '' });
  const { usuario } = useAuth();

  const cargar = () => {
    setCargando(true);
    getTodasCitas({ estado: filtroEstado || undefined })
      .then(setCitas)
      .catch(() => toast.error('Error al cargar citas'))
      .finally(() => setCargando(false));
  };

  const recargarCita = async (id) => {
    const res = await axios.get('/api/admin/citas');
    const actualizada = res.data.find(c => c._id === id);
    if (actualizada) setCitaProgreso(actualizada);
    setCitas(res.data);
  };

  useEffect(() => { cargar(); }, [filtroEstado]);

  const guardarEdicion = async () => {
    try {
      await actualizarCita(citaEditando._id, formEdit);
      toast.success('Cita actualizada');
      setCitaEditando(null);
      cargar();
    } catch { toast.error('Error al actualizar'); }
  };

  const marcarCompletada = async (cita) => {
    if (!window.confirm(`Marcar como completada la cita de ${getNombre(cita)}?`)) return;
    try {
      await actualizarCita(cita._id, { estado: 'completada', notasAdmin: cita.notasAdmin || '' });
      toast.success('Cita completada!');
      cargar();
    } catch { toast.error('Error al actualizar'); }
  };

  const getNombre = (c) => c.nombre ? `${c.nombre} ${c.apellidoPaterno}` : c.cliente?.nombre || 'Sin nombre';
  const getTelefono = (c) => c.telefono || c.cliente?.telefono || '-';
  const getEmpresa = (c) => c.empresa || c.cliente?.empresa || '';
  const formatFecha = (f) => new Date(f).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
  const colorEstado = { pendiente: 'badge-pendiente', confirmada: 'badge-confirmada', en_proceso: 'badge-pendiente', completada: 'badge-completada', cancelada: 'badge-cancelada' };

  return (
    <div className="container page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Gestion de Citas</h1>
          <p className="page-subtitle">Administra y da seguimiento a todas las citas</p>
        </div>
        {usuario?.rol === 'admin' && <Link to="/admin/agendar" className="btn btn-primary">+ Nueva Cita</Link>}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {ESTADOS.map(e => (
          <button key={e} onClick={() => setFiltroEstado(e)} className={`btn btn-sm ${filtroEstado === e ? 'btn-primary' : 'btn-secondary'}`}>
            {e || 'Todas'}
          </button>
        ))}
      </div>

      {cargando ? <div className="spinner" /> : citas.length === 0 ? (
        <div className="empty-state"><div className="icon">No hay citas</div></div>
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
              {citas.map(c => {
                const comp = c.progreso?.filter(p => p.completado).length || 0;
                const tot = c.progreso?.length || 5;
                const pct = Math.round((comp / tot) * 100);
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
                        <button className="btn btn-sm" style={{ background: 'var(--azul)', color: 'white' }} onClick={() => setCitaProgreso(c)}>
                          Progreso
                        </button>
                        {usuario?.rol === 'admin' && (c.estado === 'confirmada' || c.estado === 'pendiente' || c.estado === 'en_proceso') && (
                          <button className="btn btn-sm" style={{ background: 'var(--verde)', color: 'white' }} onClick={() => marcarCompletada(c)}>Completar</button>
                        )}
                        {usuario?.rol === 'admin' && (
                          <button className="btn btn-secondary btn-sm" onClick={() => { setCitaEditando(c); setFormEdit({ estado: c.estado, notasAdmin: c.notasAdmin || '' }); }}>Editar</button>
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

      {citaProgreso && <ModalProgreso cita={citaProgreso} onCerrar={() => setCitaProgreso(null)} onActualizar={recargarCita} />}

      {citaEditando && usuario?.rol === 'admin' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px' }}>
            <h3 style={{ color: 'var(--amarillo)', marginBottom: '1.25rem', fontSize: '1.4rem' }}>Actualizar Cita</h3>
            <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'var(--gris-medio)', borderRadius: '4px', fontSize: '0.9rem' }}>
              <strong>{getNombre(citaEditando)}</strong> - {citaEditando.servicio?.nombre}
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
              <button className="btn btn-secondary" onClick={() => setCitaEditando(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={guardarEdicion}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCitas;
