const router = require('express').Router();
const Donacion = require('../models/Donacion');
const { auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const donaciones = await Donacion.find({ donante: req.usuario._id })
      .populate('producto', 'nombre unidad categoria meta')
      .sort({ fecha: -1 });
    res.json(donaciones);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener donaciones', error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { producto, cantidad, unidad, fecha, hora, notas, direccion } = req.body;

    const conflicto = await Donacion.findOne({
      fecha: new Date(fecha),
      hora,
      estado: { $in: ['pendiente', 'confirmada', 'en_camino'] }
    });
    if (conflicto) return res.status(400).json({ mensaje: 'Ese horario ya está reservado' });

    const donacion = new Donacion({
      donante: req.usuario._id,
      producto,
      cantidad: cantidad || 1,
      unidad: unidad || 'pieza',
      fecha: new Date(fecha),
      hora,
      notas,
      direccion
    });
    await donacion.save();
    await donacion.populate('producto', 'nombre unidad categoria');

    res.status(201).json(donacion);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al crear donación', error: err.message });
  }
});

router.put('/:id/cancelar', auth, async (req, res) => {
  try {
    const donacion = await Donacion.findOne({ _id: req.params.id, donante: req.usuario._id });
    if (!donacion) return res.status(404).json({ mensaje: 'Donación no encontrada' });
    if (donacion.estado === 'entregada') return res.status(400).json({ mensaje: 'No se puede cancelar una donación entregada' });

    donacion.estado = 'cancelada';
    await donacion.save();
    res.json({ mensaje: 'Donación cancelada', donacion });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al cancelar donación', error: err.message });
  }
});

router.get('/disponibilidad', auth, async (req, res) => {
  try {
    const { fecha } = req.query;
    const horariosBase = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'];

    const ocupados = await Donacion.find({
      fecha: new Date(fecha),
      estado: { $in: ['pendiente', 'confirmada', 'en_camino'] }
    }).select('hora');

    const horasOcupadas = ocupados.map(d => d.hora);
    const disponibles = horariosBase.filter(h => !horasOcupadas.includes(h));

    res.json({ fecha, disponibles, ocupados: horasOcupadas });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al verificar disponibilidad', error: err.message });
  }
});

module.exports = router;

router.post('/publico', async (req, res) => {
  try {
    const { nombre, apellidoPaterno, telefono, email, organizacion, producto, cantidad, unidad, fecha, hora, direccion, notas } = req.body;
    if (!nombre || !apellidoPaterno || !telefono || !fecha || !hora)
      return res.status(400).json({ mensaje: 'Faltan campos requeridos' });

    const donacionData = {
      nombre, apellidoPaterno, telefono, email: email || '',
      organizacion: organizacion || '', fecha, hora,
      direccion: direccion || '', notas: notas || '',
      cantidad: cantidad || 1, unidad: unidad || 'pieza',
      estado: 'pendiente'
    };
    if (producto) donacionData.producto = producto;
    const donacion = new Donacion(donacionData);
    await donacion.save();
    await donacion.populate('producto', 'nombre unidad');
    res.status(201).json({ mensaje: 'Donación registrada', numeroDonacion: donacion.numeroDonacion, donacion });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al registrar donación', error: err.message });
  }
});