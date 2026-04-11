import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Servicios from './pages/Servicios';
import MisPedidos from './pages/MisPedidos';
import AdminDashboard from './pages/AdminDashboard';
import AdminPedidos from './pages/AdminPedidos';
import AdminAgendar from './pages/AdminAgendar';
import AdminServicios from './pages/AdminServicios';
import AdminEmpleados from './pages/AdminEmpleados';
import AdminTrabajadores from './pages/AdminTrabajadores';
import './index.css';

// Ruta protegida por rol
const RutaProtegida = ({ children, roles }) => {
  const { usuario, cargando } = useAuth();
  if (cargando) return <div className="spinner" style={{ marginTop: '4rem' }} />;
  if (!usuario) return <Navigate to="/login" />;
  if (roles && !roles.includes(usuario.rol)) return <Navigate to="/" />;
  return children;
};

const AppRoutes = () => (
  <>
    <Navbar />
    <Routes>
      {/* Rutas PÚBLICAS — cualquier persona puede entrar */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/servicios" element={<Servicios />} />

      {/* Rutas de cliente registrado */}
      <Route path="/mis-pedidos" element={<RutaProtegida roles={['cliente']}><MisPedidos /></RutaProtegida>} />

      {/* Rutas de admin y empleado */}
      <Route path="/admin" element={<RutaProtegida roles={['admin', 'empleado']}><AdminDashboard /></RutaProtegida>} />
      <Route path="/admin/pedidos" element={<RutaProtegida roles={['admin', 'empleado']}><AdminPedidos /></RutaProtegida>} />

      {/* Rutas solo admin */}
      <Route path="/admin/agendar" element={<RutaProtegida roles={['admin']}><AdminAgendar /></RutaProtegida>} />
      <Route path="/admin/servicios" element={<RutaProtegida roles={['admin']}><AdminServicios /></RutaProtegida>} />
      <Route path="/admin/empleados" element={<RutaProtegida roles={['admin']}><AdminEmpleados /></RutaProtegida>} />
      <Route path="/admin/trabajadores" element={<RutaProtegida roles={['admin']}><AdminTrabajadores /></RutaProtegida>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  </>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          style: { background: '#1A1A1A', color: '#F8F8F8', border: '1px solid rgba(245,197,24,0.3)' },
          success: { iconTheme: { primary: '#F5C518', secondary: '#0A0A0A' } }
        }} />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
