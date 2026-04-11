const router = require('express').Router();
const Servicio = require('../models/Servicio');
const { auth, esAdmin } = require('../middleware/auth');

// GET /api/servicios - Listar servicios activos (público)
router.get('/', async (req, res) => {
  try {
    const { categoria } = req.query;
    const filtro = req.query.todos === "true" ? {} : { activo: true };
    if (categoria) filtro.categoria = categoria;

    const servicios = await Servicio.find(filtro).sort({ nombre: 1 });
    res.json(servicios);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener servicios', error: err.message });
  }
});

// GET /api/servicios/:id
router.get('/:id', async (req, res) => {
  try {
    const servicio = await Servicio.findById(req.params.id);
    if (!servicio) return res.status(404).json({ mensaje: 'Servicio no encontrado' });
    res.json(servicio);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener servicio', error: err.message });
  }
});

// POST /api/servicios - Crear servicio (solo admin)
router.post('/', auth, esAdmin, async (req, res) => {
  try {
    const servicio = new Servicio(req.body);
    await servicio.save();
    res.status(201).json(servicio);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al crear servicio', error: err.message });
  }
});

// PUT /api/servicios/:id - Actualizar servicio (solo admin)
router.put('/:id', auth, esAdmin, async (req, res) => {
  try {
    const servicio = await Servicio.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!servicio) return res.status(404).json({ mensaje: 'Servicio no encontrado' });
    res.json(servicio);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al actualizar servicio', error: err.message });
  }
});

// DELETE /api/servicios/:id - Desactivar servicio (solo admin)
router.delete('/:id', auth, esAdmin, async (req, res) => {
  try {
    const servicio = await Servicio.findByIdAndUpdate(req.params.id, { activo: false }, { new: true });
    if (!servicio) return res.status(404).json({ mensaje: 'Servicio no encontrado' });
    res.json({ mensaje: 'Servicio desactivado', servicio });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al eliminar servicio', error: err.message });
  }
});

module.exports = router;
