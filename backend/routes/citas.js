const router = require('express').Router();
const Cita = require('../models/Cita');
const { auth } = require('../middleware/auth');

// GET /api/citas - Citas del cliente autenticado
router.get('/', auth, async (req, res) => {
  try {
    const citas = await Cita.find({ cliente: req.usuario._id })
      .populate('servicio', 'nombre precio duracionMinutos categoria')
      .sort({ fecha: -1 });
    res.json(citas);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener citas', error: err.message });
  }
});

// POST /api/citas - Crear cita
router.post('/', auth, async (req, res) => {
  try {
    const { servicio, fecha, hora, notas, direccion } = req.body;

    // Verificar disponibilidad
    const conflicto = await Cita.findOne({
      fecha: new Date(fecha),
      hora,
      estado: { $in: ['pendiente', 'confirmada'] }
    });
    if (conflicto) return res.status(400).json({ mensaje: 'Ese horario ya está reservado' });

    const cita = new Cita({
      cliente: req.usuario._id,
      servicio,
      fecha: new Date(fecha),
      hora,
      notas,
      direccion
    });
    await cita.save();
    await cita.populate('servicio', 'nombre precio duracionMinutos');

    res.status(201).json(cita);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al crear cita', error: err.message });
  }
});

// PUT /api/citas/:id/cancelar - Cancelar cita
router.put('/:id/cancelar', auth, async (req, res) => {
  try {
    const cita = await Cita.findOne({ _id: req.params.id, cliente: req.usuario._id });
    if (!cita) return res.status(404).json({ mensaje: 'Cita no encontrada' });
    if (cita.estado === 'completada') return res.status(400).json({ mensaje: 'No se puede cancelar una cita completada' });

    cita.estado = 'cancelada';
    await cita.save();
    res.json({ mensaje: 'Cita cancelada exitosamente', cita });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al cancelar cita', error: err.message });
  }
});

// GET /api/citas/disponibilidad - Horarios disponibles
router.get('/disponibilidad', auth, async (req, res) => {
  try {
    const { fecha } = req.query;
    const horariosBase = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'];

    const ocupados = await Cita.find({
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
