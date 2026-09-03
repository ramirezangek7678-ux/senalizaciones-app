import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProductos } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CATEGORIAS = [
  { value: '', label: 'Todos' },
  { value: 'alimentos', label: 'Alimentos' },
  { value: 'ropa', label: 'Ropa' },
  { value: 'medicamentos', label: 'Medicamentos' },
  { value: 'juguetes', label: 'Juguetes' },
  { value: 'higiene', label: 'Higiene' },
  { value: 'escolar', label: 'Escolares' },
];

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [categoria, setCategoria] = useState('');
  const { usuario } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setCargando(true);
    getProductos(categoria)
      .then(setProductos)
      .catch(() => toast.error('Error al cargar insumos'))
      .finally(() => setCargando(false));
  }, [categoria]);

  const handleDonar = (producto) => {
    if (!usuario) {
      toast('Inicia sesión para registrar una donación', { icon: '🔒' });
      navigate('/login');
      return;
    }
    navigate('/admin/registrar', { state: { productoId: producto._id } });
  };

  const etiquetaCategoria = (cat) => cat.replace(/_/g, ' ');

  return (
    <div className="container page">
      <h1 className="page-title">Insumos que Necesitamos</h1>
      <p className="page-subtitle">Selecciona el insumo y registra tu donación</p>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {CATEGORIAS.map(c => (
          <button
            key={c.value}
            onClick={() => setCategoria(c.value)}
            className={`btn btn-sm ${categoria === c.value ? 'btn-primary' : 'btn-secondary'}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {cargando ? (
        <div className="spinner" />
      ) : productos.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📦</div>
          <p>No hay insumos disponibles en esta categoría</p>
        </div>
      ) : (
        <div className="grid-3">
          {productos.map(p => (
            <div key={p._id} className="servicio-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span className="servicio-categoria">{etiquetaCategoria(p.categoria)}</span>
                {p.meta > 0 && <span style={{ fontSize: '0.8rem', color: 'var(--blanco-apagado)' }}>Meta: {p.meta} {p.unidad}s</span>}
              </div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: 'var(--blanco)' }}>{p.nombre}</h3>
              <p style={{ color: 'var(--blanco-apagado)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                {p.descripcion}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--blanco-apagado)', fontSize: '0.85rem' }}>
                  📏 Unidad: {p.unidad}
                </span>
                <button className="btn btn-primary btn-sm" onClick={() => handleDonar(p)}>
                  Donar →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Productos;