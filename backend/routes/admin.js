const router = require('express').Router();
const Donacion = require('../models/Donacion');
const SolicitudDonacion = require('../models/SolicitudDonacion');
const Usuario = require('../models/Usuario');
const { auth, esAdmin, esAdminOVoluntario } = require('../middleware/auth');

router.get('/donaciones', auth, esAdminOVoluntario, async (req, res) => {
  try {
    const { estado } = req.query;
    const filtro = {};
    if (estado) filtro.estado = estado;
    const donaciones = await Donacion.find(filtro)
      .populate('donante', 'nombre email telefono organizacion')
      .populate('producto', 'nombre unidad categoria meta')
      .sort({ fecha: 1, hora: 1 });
    res.json(donaciones);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener donaciones', error: err.message });
  }
});

router.put('/donaciones/:id', auth, esAdminOVoluntario, async (req, res) => {
  try {
    const { estado, notasAdmin } = req.body;
    if (req.usuario.rol === 'voluntario' && estado !== 'entregada' && estado !== 'en_camino')
      return res.status(403).json({ mensaje: 'Acceso denegado' });
    const donacion = await Donacion.findByIdAndUpdate(
      req.params.id,
      { estado, notasAdmin, updatedAt: Date.now() },
      { new: true }
    ).populate('producto', 'nombre');
    if (!donacion) return res.status(404).json({ mensaje: 'Donación no encontrada' });
    res.json(donacion);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al actualizar donación', error: err.message });
  }
});

router.put('/donaciones/:id/progreso', auth, esAdminOVoluntario, async (req, res) => {
  try {
    const { pasoIndex, completado, notas } = req.body;
    const donacion = await Donacion.findById(req.params.id);
    if (!donacion) return res.status(404).json({ mensaje: 'Donación no encontrada' });

    donacion.progreso[pasoIndex].completado = completado;
    donacion.progreso[pasoIndex].notas = notas || '';
    donacion.progreso[pasoIndex].fecha = completado ? new Date() : null;

    const totalCompletados = donacion.progreso.filter(p => p.completado).length;
    if (totalCompletados === donacion.progreso.length) {
      donacion.estado = 'entregada';
    } else if (totalCompletados > 0) {
      donacion.estado = 'en_camino';
    }

    donacion.updatedAt = Date.now();
    await donacion.save();
    res.json(donacion);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al actualizar progreso', error: err.message });
  }
});

router.get('/dashboard', auth, esAdminOVoluntario, async (req, res) => {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    const [totalDonaciones, donacionesHoy, pendientes, confirmadas, voluntarios] = await Promise.all([
      Donacion.countDocuments(),
      Donacion.countDocuments({ fecha: { $gte: hoy, $lt: manana } }),
      Donacion.countDocuments({ estado: 'pendiente' }),
      Donacion.countDocuments({ estado: { $in: ['confirmada', 'en_camino'] } }),
      Usuario.countDocuments({ rol: 'voluntario' })
    ]);

    const proximasDonaciones = await Donacion.find({
      fecha: { $gte: hoy },
      estado: { $in: ['pendiente', 'confirmada', 'en_camino'] }
    })
      .populate('producto', 'nombre')
      .sort({ fecha: 1, hora: 1 })
      .limit(5);

    const estadosCounts = await Donacion.aggregate([
      { $group: { _id: '$estado', total: { $sum: 1 } } }
    ]);
    const donacionesPorEstado = estadosCounts.map(e => ({ estado: e._id, total: e.total }));

    const hace6Meses = new Date();
    hace6Meses.setMonth(hace6Meses.getMonth() - 5);
    hace6Meses.setDate(1);
    hace6Meses.setHours(0, 0, 0, 0);
    const donacionesPorMesRaw = await Donacion.aggregate([
      { $match: { createdAt: { $gte: hace6Meses } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, total: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const donacionesPorMes = donacionesPorMesRaw.map(m => ({
      mes: meses[m._id.month - 1],
      total: m.total
    }));

    const solicitudesDonantes = await SolicitudDonacion.find({ estado: 'pendiente' })
      .sort({ fecha: 1, hora: 1 })
      .limit(10);

    res.json({ totalDonaciones, donacionesHoy, pendientes, confirmadas, voluntarios, proximasDonaciones, donacionesPorEstado, donacionesPorMes, solicitudesDonantes });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener estadísticas', error: err.message });
  }
});

router.get('/voluntarios', auth, esAdmin, async (req, res) => {
  try {
    const voluntarios = await Usuario.find({ rol: 'voluntario' }).select('-password').sort({ createdAt: -1 });
    res.json(voluntarios);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener voluntarios', error: err.message });
  }
});

router.post('/voluntarios', auth, esAdmin, async (req, res) => {
  try {
    const { nombre, email, password, telefono } = req.body;
    const existe = await Usuario.findOne({ email });
    if (existe) return res.status(400).json({ mensaje: 'El email ya está registrado' });
    const voluntario = new Usuario({ nombre, email, password, telefono, rol: 'voluntario' });
    await voluntario.save();
    res.status(201).json({ mensaje: 'Voluntario creado', voluntario: { id: voluntario._id, nombre: voluntario.nombre, email: voluntario.email } });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al crear voluntario', error: err.message });
  }
});

router.put('/voluntarios/:id', auth, esAdmin, async (req, res) => {
  try {
    const voluntario = await Usuario.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    if (!voluntario) return res.status(404).json({ mensaje: 'Voluntario no encontrado' });
    res.json(voluntario);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al actualizar voluntario', error: err.message });
  }
});

router.post('/registrar-donacion', auth, esAdmin, async (req, res) => {
  try {
    const { nombre, apellidoPaterno, apellidoMaterno, telefono, email, organizacion, producto, cantidad, unidad, fecha, hora, notas, direccion } = req.body;

    if (!nombre || !apellidoPaterno || !telefono)
      return res.status(400).json({ mensaje: 'Nombre, apellido paterno y teléfono son requeridos' });

    const conflicto = await Donacion.findOne({
      fecha: new Date(fecha), hora,
      estado: { $in: ['pendiente', 'confirmada', 'en_camino'] }
    });
    if (conflicto) return res.status(400).json({ mensaje: 'Ese horario ya está ocupado' });

    const donacion = new Donacion({
      nombre, apellidoPaterno,
      apellidoMaterno: apellidoMaterno || '',
      telefono, email: email || '',
      organizacion: organizacion || '',
      producto, cantidad: cantidad || 1, unidad: unidad || 'pieza',
      fecha: new Date(fecha), hora,
      notas, direccion, estado: 'confirmada'
    });
    await donacion.save();
    await donacion.populate('producto', 'nombre unidad');
    res.status(201).json(donacion);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al registrar donación', error: err.message });
  }
});

module.exports = router;

router.get('/rastrear/:numero', async (req, res) => {
  try {
    const donacion = await Donacion.findOne({ numeroDonacion: req.params.numero.toUpperCase() })
      .populate('producto', 'nombre unidad');
    if (!donacion) return res.status(404).json({ mensaje: 'Donación no encontrada' });
    res.json({
      numeroDonacion: donacion.numeroDonacion,
      estado: donacion.estado,
      producto: donacion.producto?.nombre,
      fecha: donacion.fecha,
      hora: donacion.hora,
      progreso: donacion.progreso,
      notasAdmin: donacion.notasAdmin,
      nombre: donacion.nombre || donacion.donante?.nombre || ''
    });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al rastrear donación', error: err.message });
  }
});