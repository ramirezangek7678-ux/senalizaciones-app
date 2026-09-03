import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const ESTADOS = ['pendiente', 'confirmada', 'cancelada'];

const AdminSolicitudes = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [busqueda, setBusqueda] = useState('');

  const cargar = () => {
    setCargando(true);
    api.get('/api/solicitudes')
      .then(r => setSolicitudes(Array.isArray(r.data) ? r.data : []))
      .catch(() => toast.error('Error al cargar solicitudes'))
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargar(); }, []);

  const actualizarEstado = async (id, estado) => {
    try {
      await api.put(`/api/solicitudes/${id}`, { estado });
      toast.success(`Solicitud ${estado}`);
      cargar();
    } catch { toast.error('Error al actualizar'); }
  };

  const eliminar = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar la solicitud de ${nombre}?`)) return;
    try {
      await api.delete(`/api/solicitudes/${id}`);
      toast.success('Solicitud eliminada');
      cargar();
    } catch { toast.error('Error al eliminar'); }
  };

  const formatFecha = f => new Date(f).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });

  const filtradas = solicitudes
    .filter(c => !filtro || c.estado === filtro)
    .filter(c => !busqueda ||
      `${c.nombre} ${c.apellidoPaterno}`.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.telefono.includes(busqueda)
    );

  const colorEstado = { pendiente: '#F5C518', confirmada: '#22C55E', cancelada: '#EF4444' };

  return (
    <div className="container page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">📅 Solicitudes de Donantes</h1>
          <p className="page-subtitle">Solicitudes agendadas directamente por los donantes</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'Barlow Condensed', fontSize: '2rem', fontWeight: 800, color: 'var(--amarillo)' }}>
            {solicitudes.filter(c => c.estado === 'pendiente').length}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--blanco-apagado)' }}>pendientes</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className={`btn btn-sm ${filtro === '' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFiltro('')}>Todas</button>
          {ESTADOS.map(e => (
            <button key={e} className={`btn btn-sm ${filtro === e ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFiltro(e)} style={{ textTransform: 'capitalize' }}>{e}</button>
          ))}
        </div>
        <input className="form-input" style={{ maxWidth: '260px', padding: '0.5rem 1rem' }}
          placeholder="🔍 Buscar nombre o teléfono..."
          value={busqueda} onChange={e => setBusqueda(e.target.value)} />
      </div>

      <div style={{ fontSize: '0.85rem', color: 'var(--blanco-apagado)', marginBottom: '0.75rem' }}>
        Mostrando <strong style={{ color: 'var(--amarillo)' }}>{filtradas.length}</strong> de {solicitudes.length} solicitudes
      </div>

      {cargando ? <div className="spinner" /> : filtradas.length === 0 ? (
        <div className="empty-state"><div className="icon">📅</div><p>No hay solicitudes</p></div>
      ) : (
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <table className="tabla">
            <thead>
              <tr>
                <th>Nº Solicitud</th>
                <th>Donante</th>
                <th>Teléfono</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Tipo</th>
                <th>Notas</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map(c => (
                <tr key={c._id}>
                  <td style={{ fontFamily: 'Barlow Condensed', fontSize: '1rem', fontWeight: 800, color: 'var(--amarillo)', letterSpacing: '1px' }}>
                    {c.numeroSolicitud}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{c.nombre} {c.apellidoPaterno}</div>
                    {c.email && <div style={{ fontSize: '0.8rem', color: 'var(--blanco-apagado)' }}>{c.email}</div>}
                  </td>
                  <td>{c.telefono}</td>
                  <td>{formatFecha(c.fecha)}</td>
                  <td>{c.hora}</td>
                  <td style={{ fontSize: '0.85rem', textTransform: 'capitalize' }}>{c.tipoDonacion || 'recolección'}</td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--blanco-apagado)', maxWidth: '150px' }}>
                    {c.notas || '—'}
                  </td>
                  <td>
                    <span style={{
                      background: colorEstado[c.estado], color: c.estado === 'pendiente' ? '#000' : '#fff',
                      padding: '0.25rem 0.75rem', borderRadius: '20px',
                      fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase'
                    }}>{c.estado}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {c.estado === 'pendiente' && (
                        <button className="btn btn-sm" style={{ background: '#22C55E', color: 'white' }}
                          onClick={() => actualizarEstado(c._id, 'confirmada')}>Confirmar</button>
                      )}
                      {c.estado !== 'cancelada' && (
                        <button className="btn btn-sm" style={{ background: '#EF4444', color: 'white' }}
                          onClick={() => actualizarEstado(c._id, 'cancelada')}>Cancelar</button>
                      )}
                      <button className="btn btn-secondary btn-sm"
                        onClick={() => eliminar(c._id, `${c.nombre} ${c.apellidoPaterno}`)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminSolicitudes;