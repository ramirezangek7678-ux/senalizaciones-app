const router = require('express').Router();
const Pedido = require('../models/Pedido');
const Usuario = require('../models/Usuario');
const { auth, esAdmin, esAdminOEmpleado } = require('../middleware/auth');

// GET /api/admin/citas
router.get('/pedidos', auth, esAdminOEmpleado, async (req, res) => {
  try {
    const { estado } = req.query;
    const filtro = {};
    if (estado) filtro.estado = estado;
    const pedidos = await Pedido.find(filtro)
      .populate('cliente', 'nombre email telefono empresa')
      .populate('servicio', 'nombre precio duracionMinutos categoria')
      .sort({ fecha: 1, hora: 1 });
    res.json(pedidos);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener pedidos', error: err.message });
  }
});

// PUT /api/admin/citas/:id — actualizar estado y notas
router.put('/pedidos/:id', auth, esAdminOEmpleado, async (req, res) => {
  try {
    const { estado, notasAdmin } = req.body;
    if (req.usuario.rol === 'empleado' && estado !== 'completada' && estado !== 'en_proceso')
      return res.status(403).json({ mensaje: 'Acceso denegado' });
    const pedido = await Pedido.findByIdAndUpdate(
      req.params.id,
      { estado, notasAdmin, updatedAt: Date.now() },
      { new: true }
    ).populate('servicio', 'nombre');
    if (!pedido) return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    res.json(pedido);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al actualizar pedido', error: err.message });
  }
});

// PUT /api/admin/citas/:id/progreso — actualizar un paso del progreso
router.put('/pedidos/:id/progreso', auth, esAdminOEmpleado, async (req, res) => {
  try {
    const { pasoIndex, completado, notas } = req.body;
    const pedido = await Pedido.findById(req.params.id);
    if (!pedido) return res.status(404).json({ mensaje: 'Pedido no encontrado' });

    pedido.progreso[pasoIndex].completado = completado;
    pedido.progreso[pasoIndex].notas = notas || '';
    pedido.progreso[pasoIndex].fecha = completado ? new Date() : null;

    // Auto cambiar estado según progreso
    const totalCompletados = pedido.progreso.filter(p => p.completado).length;
    if (totalCompletados === pedido.progreso.length) {
      pedido.estado = 'completada';
    } else if (totalCompletados > 0) {
      pedido.estado = 'en_proceso';
    }

    pedido.updatedAt = Date.now();
    await pedido.save();
    res.json(pedido);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al actualizar progreso', error: err.message });
  }
});

// GET /api/admin/dashboard
router.get('/dashboard', auth, esAdminOEmpleado, async (req, res) => {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    const [totalPedidos, pedidosHoy, pendientes, confirmadas, empleados] = await Promise.all([
      Pedido.countDocuments(),
      Pedido.countDocuments({ fecha: { $gte: hoy, $lt: manana } }),
      Pedido.countDocuments({ estado: 'pendiente' }),
      Pedido.countDocuments({ estado: { $in: ['confirmada', 'en_proceso'] } }),
      Usuario.countDocuments({ rol: 'empleado' })
    ]);

    const proximosPedidos = await Pedido.find({
      fecha: { $gte: hoy },
      estado: { $in: ['pendiente', 'confirmada', 'en_proceso'] }
    })
      .populate('servicio', 'nombre')
      .sort({ fecha: 1, hora: 1 })
      .limit(5);

    // Pedidos por estado
    const estadosCounts = await Pedido.aggregate([
      { $group: { _id: '$estado', total: { $sum: 1 } } }
    ]);
    const pedidosPorEstado = estadosCounts.map(e => ({ estado: e._id, total: e.total }));

    // Pedidos por mes (últimos 6 meses)
    const hace6Meses = new Date();
    hace6Meses.setMonth(hace6Meses.getMonth() - 5);
    hace6Meses.setDate(1);
    hace6Meses.setHours(0, 0, 0, 0);
    const pedidosPorMesRaw = await Pedido.aggregate([
      { $match: { createdAt: { $gte: hace6Meses } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, total: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const pedidosPorMes = pedidosPorMesRaw.map(m => ({
      mes: meses[m._id.month - 1],
      total: m.total
    }));

    res.json({ totalPedidos, pedidosHoy, pendientes, confirmadas, empleados, proximosPedidos, pedidosPorEstado, pedidosPorMes });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener estadísticas', error: err.message });
  }
});

// GET /api/admin/empleados
router.get('/empleados', auth, esAdmin, async (req, res) => {
  try {
    const empleados = await Usuario.find({ rol: 'empleado' }).select('-password').sort({ createdAt: -1 });
    res.json(empleados);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener empleados', error: err.message });
  }
});

// POST /api/admin/empleados
router.post('/empleados', auth, esAdmin, async (req, res) => {
  try {
    const { nombre, email, password, telefono } = req.body;
    const existe = await Usuario.findOne({ email });
    if (existe) return res.status(400).json({ mensaje: 'El email ya está registrado' });
    const empleado = new Usuario({ nombre, email, password, telefono, rol: 'empleado' });
    await empleado.save();
    res.status(201).json({ mensaje: 'Empleado creado', empleado: { id: empleado._id, nombre: empleado.nombre, email: empleado.email } });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al crear empleado', error: err.message });
  }
});

// PUT /api/admin/empleados/:id
router.put('/empleados/:id', auth, esAdmin, async (req, res) => {
  try {
    const empleado = await Usuario.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    if (!empleado) return res.status(404).json({ mensaje: 'Empleado no encontrado' });
    res.json(empleado);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al actualizar empleado', error: err.message });
  }
});

// POST /api/admin/agendar
router.post('/agendar', auth, esAdmin, async (req, res) => {
  try {
    const { nombre, apellidoPaterno, apellidoMaterno, telefono, email, empresa, servicio, fecha, hora, notas, direccion } = req.body;

    if (!nombre || !apellidoPaterno || !telefono)
      return res.status(400).json({ mensaje: 'Nombre, apellido paterno y teléfono son requeridos' });

    const conflicto = await Pedido.findOne({
      fecha: new Date(fecha), hora,
      estado: { $in: ['pendiente', 'confirmada', 'en_proceso'] }
    });
    if (conflicto) return res.status(400).json({ mensaje: 'Ese horario ya está ocupado' });

    const pedido = new Pedido({
      nombre, apellidoPaterno,
      apellidoMaterno: apellidoMaterno || '',
      telefono, email: email || '',
      empresa: empresa || '',
      servicio, fecha: new Date(fecha), hora,
      notas, direccion, estado: 'confirmada'
    });
    await pedido.save();
    await pedido.populate('servicio', 'nombre precio');
    res.status(201).json(pedido);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al crear pedido', error: err.message });
  }
});

module.exports = router;
