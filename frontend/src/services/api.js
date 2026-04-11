import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || '';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// SERVICIOS
export const getServicios = (categoria) =>
  api.get('/api/servicios', { params: { categoria } }).then(r => r.data);

// PEDIDOS
export const getMisPedidos = () =>
  api.get('/api/pedidos').then(r => r.data);

export const crearPedido = (datos) =>
  api.post('/api/pedidos', datos).then(r => r.data);

export const cancelarPedido = (id) =>
  api.put(`/api/pedidos/${id}/cancelar`).then(r => r.data);

export const getDisponibilidad = (fecha) =>
  api.get('/api/pedidos/disponibilidad', { params: { fecha } }).then(r => r.data);

// ADMIN
export const getDashboard = () =>
  api.get('/api/admin/dashboard').then(r => r.data);

export const getTodosPedidos = (filtros) =>
  api.get('/api/admin/pedidos', { params: filtros }).then(r => r.data);

export const actualizarPedido = (id, datos) =>
  api.put(`/api/admin/pedidos/${id}`, datos).then(r => r.data);

export const getClientes = () =>
  api.get('/api/admin/clientes').then(r => r.data);

export const crearServicio = (datos) =>
  api.post('/api/servicios', datos).then(r => r.data);

export const actualizarServicio = (id, datos) =>
  api.put(`/api/servicios/${id}`, datos).then(r => r.data);

export default api;
