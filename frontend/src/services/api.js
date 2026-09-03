import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || '';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// PRODUCTOS (insumos a donar)
export const getProductos = (categoria) =>
  api.get('/api/productos', { params: { categoria } }).then(r => r.data);

export const crearProducto = (datos) =>
  api.post('/api/productos', datos).then(r => r.data);

export const actualizarProducto = (id, datos) =>
  api.put(`/api/productos/${id}`, datos).then(r => r.data);

// DONACIONES
export const getMisDonaciones = () =>
  api.get('/api/donaciones').then(r => r.data);

export const crearDonacion = (datos) =>
  api.post('/api/donaciones', datos).then(r => r.data);

export const cancelarDonacion = (id) =>
  api.put(`/api/donaciones/${id}/cancelar`).then(r => r.data);

export const getDisponibilidad = (fecha) =>
  api.get('/api/donaciones/disponibilidad', { params: { fecha } }).then(r => r.data);

// ADMIN
export const getDashboard = () =>
  api.get('/api/admin/dashboard').then(r => r.data);

export const getTodasDonaciones = (filtros) =>
  api.get('/api/admin/donaciones', { params: filtros }).then(r => r.data);

export const actualizarDonacion = (id, datos) =>
  api.put(`/api/admin/donaciones/${id}`, datos).then(r => r.data);

export const getDonantes = () =>
  api.get('/api/admin/donantes').then(r => r.data);

export default api;