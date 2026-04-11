const router = require('express').Router();
const Pedido = require('../models/Pedido');
const { auth } = require('../middleware/auth');

// GET /api/citas - Citas del cliente autenticado
router.get('/', auth, async (req, res) => {
  try {
    const pedidos = await Pedido.find({ cliente: req.usuario._id })
      .populate('servicio', 'nombre precio duracionMinutos categoria')
      .sort({ fecha: -1 });
    res.json(pedidos);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener pedidos', error: err.message });
  }
});

// POST /api/citas - Crear cita
router.post('/', auth, async (req, res) => {
  try {
    const { servicio, fecha, hora, notas, direccion } = req.body;

    // Verificar disponibilidad
    const conflicto = await Pedido.findOne({
      fecha: new Date(fecha),
      hora,
      estado: { $in: ['pendiente', 'confirmada'] }
    });
    if (conflicto) return res.status(400).json({ mensaje: 'Ese horario ya está reservado' });

    const pedido = new Pedido({
      cliente: req.usuario._id,
      servicio,
      fecha: new Date(fecha),
      hora,
      notas,
      direccion
    });
    await pedido.save();
    await pedido.populate('servicio', 'nombre precio duracionMinutos');

    res.status(201).json(pedido);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al crear pedido', error: err.message });
  }
});

// PUT /api/citas/:id/cancelar - Cancelar cita
router.put('/:id/cancelar', auth, async (req, res) => {
  try {
    const pedido = await Pedido.findOne({ _id: req.params.id, cliente: req.usuario._id });
    if (!pedido) return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    if (pedido.estado === 'completada') return res.status(400).json({ mensaje: 'No se puede cancelar un pedido completado' });

    pedido.estado = 'cancelada';
    await pedido.save();
    res.json({ mensaje: "Pedido cancelado", pedido });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al cancelar pedido', error: err.message });
  }
});

// GET /api/citas/disponibilidad - Horarios disponibles
router.get('/disponibilidad', auth, async (req, res) => {
  try {
    const { fecha } = req.query;
    const horariosBase = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'];

    const ocupados = await Pedido.find({
      fecha: new Date(fecha),
      estado: { $in: ['pendiente', 'confirmada'] }
    }).select('hora');

    const horasOcupadas = ocupados.map(c => c.hora);
    const disponibles = horariosBase.filter(h => !horasOcupadas.includes(h));

    res.json({ fecha, disponibles, ocupados: horasOcupadas });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al verificar disponibilidad', error: err.message });
  }
});

module.exports = router;
