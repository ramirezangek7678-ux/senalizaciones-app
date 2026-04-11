import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Registro = () => {
  const [form, setForm] = useState({ nombre: '', email: '', password: '', telefono: '', empresa: '' });
  const [cargando, setCargando] = useState(false);
  const { registro } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('La contraseña debe tener al menos 6 caracteres');
    setCargando(true);
    try {
      await registro(form);
      toast.success('¡Cuenta creada exitosamente!');
      navigate('/mis-pedidos');
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al registrarse');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '480px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📋</div>
          <h2 style={{ fontSize: '2rem', color: 'var(--amarillo)' }}>CREAR CUENTA</h2>
          <p style={{ color: 'var(--blanco-apagado)', fontSize: '0.9rem' }}>Regístrate para realizar tus pedidos</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Nombre Completo</label>
              <input className="form-input" name="nombre" value={form.nombre} onChange={handleChange} placeholder="Juan Pérez" required />
            </div>
            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <input className="form-input" name="telefono" value={form.telefono} onChange={handleChange} placeholder="81 1234 5678" required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Correo Electrónico</label>
            <input className="form-input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="tu@email.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Empresa (opcional)</label>
            <input className="form-input" name="empresa" value={form.empresa} onChange={handleChange} placeholder="Nombre de tu empresa" />
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input className="form-input" type="password" name="password" value={form.password} onChange={handleChange} placeholder="Mínimo 6 caracteres" required />
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={cargando}>
            {cargando ? 'Creando cuenta...' : 'Registrarme →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--blanco-apagado)', fontSize: '0.9rem' }}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={{ color: 'var(--amarillo)', textDecoration: 'none', fontWeight: '600' }}>Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default Registro;
