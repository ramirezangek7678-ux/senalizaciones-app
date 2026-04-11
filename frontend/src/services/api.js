import axios from 'axios';

// SERVICIOS
export const getServicios = (categoria) =>
  axios.get('/api/servicios', { params: { categoria } }).then(r => r.data);

// PEDIDOS
export const getMisPedidos = () =>
  axios.get('/api/pedidos').then(r => r.data);

export const crearPedido = (datos) =>
  axios.post('/api/pedidos', datos).then(r => r.data);

export const cancelarPedido = (id) =>
  axios.put(`/api/pedidos/${id}/cancelar`).then(r => r.data);

export const getDisponibilidad = (fecha) =>
  axios.get('/api/pedidos/disponibilidad', { params: { fecha } }).then(r => r.data);

// ADMIN
export const getDashboard = () =>
  axios.get('/api/admin/dashboard').then(r => r.data);

export const getTodosPedidos = (filtros) =>
  axios.get('/api/admin/pedidos', { params: filtros }).then(r => r.data);

export const actualizarPedido = (id, datos) =>
  axios.put(`/api/admin/pedidos/${id}`, datos).then(r => r.data);

export const getClientes = () =>
  axios.get('/api/admin/clientes').then(r => r.data);

export const crearServicio = (datos) =>
  axios.post('/api/servicios', datos).then(r => r.data);

export const actualizarServicio = (id, datos) =>
  axios.put(`/api/servicios/${id}`, datos).then(r => r.data);
