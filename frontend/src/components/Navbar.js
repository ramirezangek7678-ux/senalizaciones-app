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
      <Link to="/" className="navbar-logo">⚠ Señalamiento<span> MS</span></Link>
      <div className="navbar-links">
        {!usuario ? (
          <>
            <Link to="/servicios" className={isActive('/servicios')}>Servicios</Link>
            <Link to="/login" className={isActive('/login')}>Iniciar Sesión</Link>
            <Link to="/registro" className="btn btn-primary btn-sm">Registrarse</Link>
          </>
        ) : usuario.rol === 'admin' ? (
          <>
            <Link to="/admin" className={isActive('/admin')}>Panel</Link>
            <Link to="/admin/pedidos" className={isActive('/admin/pedidos')}>Pedidos</Link>
            <Link to="/admin/agendar" className="btn btn-primary btn-sm">+ Nuevo Pedido</Link>
            <Link to="/admin/servicios" className={isActive('/admin/servicios')}>Servicios</Link>
            <Link to="/admin/trabajadores" className={isActive('/admin/trabajadores')}>Nuevo Trabajador</Link>
            <Link to="/admin/empleados" className={isActive('/admin/empleados')}>Empleados</Link>
            <button onClick={handleLogout} className="btn btn-secondary btn-sm">Salir</button>
          </>
        ) : usuario.rol === 'empleado' ? (
          <>
            <Link to="/admin/pedidos" className={isActive('/admin/pedidos')}>Ver Pedidos</Link>
            <span style={{ color: 'var(--amarillo)', fontSize: '0.9rem' }}>👷 {usuario.nombre.split(' ')[0]}</span>
            <button onClick={handleLogout} className="btn btn-secondary btn-sm">Salir</button>
          </>
        ) : (
          <>
            <Link to="/servicios" className={isActive('/servicios')}>Servicios</Link>
            <Link to="/mis-pedidos" className={isActive('/mis-pedidos')}>Mis Pedidos</Link>
            <span style={{ color: 'var(--amarillo)', fontSize: '0.9rem' }}>Hola, {usuario.nombre.split(' ')[0]}</span>
            <button onClick={handleLogout} className="btn btn-secondary btn-sm">Salir</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
