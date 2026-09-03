import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Productos from './pages/Productos';
import MisDonaciones from './pages/MisDonaciones';
import AdminDashboard from './pages/AdminDashboard';
import AdminDonaciones from './pages/AdminDonaciones';
import RegistrarDonacion from './pages/AdminRegistrarDonacion';
import Solicitar from './pages/QuieroDonar';
import AdminSolicitudes from './pages/AdminSolicitudes';
import AdminProductos from './pages/AdminProductos';
import AdminVoluntarios from './pages/AdminVoluntarios';
import AdminVoluntariosRegistro from './pages/AdminVoluntariosRegistro';
import RastrearDonacion from './pages/RastrearDonacion';
import './index.css';

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
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/productos" element={<Productos />} />
      <Route path="/rastrear" element={<RastrearDonacion />} />
      <Route path="/solicitar" element={<Solicitar />} />

      <Route path="/mis-donaciones" element={<RutaProtegida roles={['donante']}><MisDonaciones /></RutaProtegida>} />

      <Route path="/admin" element={<RutaProtegida roles={['admin', 'voluntario']}><AdminDashboard /></RutaProtegida>} />
      <Route path="/admin/donaciones" element={<RutaProtegida roles={['admin', 'voluntario']}><AdminDonaciones /></RutaProtegida>} />
      <Route path="/admin/solicitudes" element={<RutaProtegida roles={['admin', 'voluntario']}><AdminSolicitudes /></RutaProtegida>} />

      <Route path="/admin/registrar" element={<RutaProtegida roles={['admin']}><RegistrarDonacion /></RutaProtegida>} />
      <Route path="/admin/productos" element={<RutaProtegida roles={['admin']}><AdminProductos /></RutaProtegida>} />
      <Route path="/admin/voluntarios" element={<RutaProtegida roles={['admin']}><AdminVoluntarios /></RutaProtegida>} />
      <Route path="/admin/voluntarios-registro" element={<RutaProtegida roles={['admin']}><AdminVoluntariosRegistro /></RutaProtegida>} />

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