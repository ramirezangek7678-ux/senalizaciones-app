const router = require('express').Router();
const Trabajador = require('../models/Trabajador');
const { auth, esAdmin } = require('../middleware/auth');

// GET /api/trabajadores - Listar todos
router.get('/', auth, esAdmin, async (req, res) => {
  try {
    const { activo, area } = req.query;
    const filtro = {};
    if (activo !== undefined) filtro.activo = activo === 'true';
    if (area) filtro.area = area;
    const trabajadores = await Trabajador.find(filtro).sort({ apellidoPaterno: 1 });
    res.json(trabajadores);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener trabajadores', error: err.message });
  }
});

// POST /api/trabajadores - Crear trabajador
router.post('/', auth, esAdmin, async (req, res) => {
  try {
    const trabajador = new Trabajador(req.body);
    await trabajador.save();
    res.status(201).json(trabajador);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al crear trabajador', error: err.message });
  }
});

// PUT /api/trabajadores/:id - Actualizar trabajador
router.put('/:id', auth, esAdmin, async (req, res) => {
  try {
    const trabajador = await Trabajador.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!trabajador) return res.status(404).json({ mensaje: 'Trabajador no encontrado' });
    res.json(trabajador);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al actualizar trabajador', error: err.message });
  }
});

// DELETE /api/trabajadores/:id - Desactivar trabajador
router.delete('/:id', auth, esAdmin, async (req, res) => {
  try {
    const trabajador = await Trabajador.findByIdAndUpdate(req.params.id, { activo: false }, { new: true });
    if (!trabajador) return res.status(404).json({ mensaje: 'Trabajador no encontrado' });
    res.json({ mensaje: 'Trabajador desactivado', trabajador });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al desactivar trabajador', error: err.message });
  }
});

module.exports = router;
