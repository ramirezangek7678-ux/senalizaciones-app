import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">🤝 Dona<span>Red</span></Link>
      <div className="navbar-links">
        {!usuario ? (
          <>
            <Link to="/productos" className={isActive('/productos')}>Insumos</Link>
            <Link to="/solicitar" className={isActive('/solicitar')}>Quiero Donar</Link>
            <Link to="/login" className="btn btn-primary btn-sm">Iniciar Sesión</Link>
          </>
        ) : usuario.rol === 'admin' ? (
          <>
            <Link to="/admin" className={isActive('/admin')}>Panel</Link>
            <Link to="/admin/donaciones" className={isActive('/admin/donaciones')}>Donaciones</Link>
            <Link to="/admin/solicitudes" className={isActive('/admin/solicitudes')}>Solicitudes</Link>
            <Link to="/admin/registrar" className="btn btn-primary btn-sm">+ Nueva Donación</Link>
            <Link to="/admin/productos" className={isActive('/admin/productos')}>Insumos</Link>
            <Link to="/admin/voluntarios-registro" className={isActive('/admin/voluntarios-registro')}>Voluntarios</Link>
            <button onClick={handleLogout} className="btn btn-secondary btn-sm">Salir</button>
          </>
        ) : usuario.rol === 'voluntario' ? (
          <>
            <Link to="/admin/donaciones" className={isActive('/admin/donaciones')}>Ver Donaciones</Link>
            <span style={{ color: 'var(--amarillo)', fontSize: '0.9rem' }}>🤝 {usuario.nombre.split(' ')[0]}</span>
            <button onClick={handleLogout} className="btn btn-secondary btn-sm">Salir</button>
          </>
        ) : (
          <>
            <Link to="/productos" className={isActive('/productos')}>Insumos</Link>
            <Link to="/mis-donaciones" className={isActive('/mis-donaciones')}>Mis Donaciones</Link>
            <span style={{ color: 'var(--amarillo)', fontSize: '0.9rem' }}>Hola, {usuario.nombre.split(' ')[0]}</span>
            <button onClick={handleLogout} className="btn btn-secondary btn-sm">Salir</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;