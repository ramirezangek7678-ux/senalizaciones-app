import React, { useState, useEffect } from 'react';
import { getClientes } from '../services/api';
import toast from 'react-hot-toast';

const AdminClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    getClientes()
      .then(setClientes)
      .catch(() => toast.error('Error al cargar clientes'))
      .finally(() => setCargando(false));
  }, []);

  const filtrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.email.toLowerCase().includes(busqueda.toLowerCase()) ||
    (c.empresa && c.empresa.toLowerCase().includes(busqueda.toLowerCase()))
  );

  return (
    <div className="container page">
      <h1 className="page-title">Clientes Registrados</h1>
      <p className="page-subtitle">{clientes.length} clientes en el sistema</p>

      <div className="form-group" style={{ maxWidth: '360px', marginBottom: '1.5rem' }}>
        <input
          className="form-input"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="🔍 Buscar por nombre, email o empresa..."
        />
      </div>

      {cargando ? <div className="spinner" /> : (
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <table className="tabla">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Empresa</th>
                <th>Registro</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(c => (
                <tr key={c._id}>
                  <td style={{ fontWeight: 600 }}>{c.nombre}</td>
                  <td style={{ fontSize: '0.9rem', color: 'var(--blanco-apagado)' }}>{c.email}</td>
                  <td>{c.telefono}</td>
                  <td>{c.empresa || '—'}</td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--blanco-apagado)' }}>
                    {new Date(c.createdAt).toLocaleDateString('es-MX')}
                  </td>
                  <td>
                    <span className={`badge ${c.activo ? 'badge-confirmada' : 'badge-cancelada'}`}>
                      {c.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtrados.length === 0 && (
            <div className="empty-state">
              <p>Sin resultados para "{busqueda}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminClientes;
