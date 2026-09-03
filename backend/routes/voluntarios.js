const router = require('express').Router();
const Voluntario = require('../models/Voluntario');
const { auth, esAdmin } = require('../middleware/auth');

router.get('/', auth, esAdmin, async (req, res) => {
  try {
    const { activo, area } = req.query;
    const filtro = {};
    if (activo !== undefined) filtro.activo = activo === 'true';
    if (area) filtro.area = area;
    const voluntarios = await Voluntario.find(filtro).sort({ apellidoPaterno: 1 });
    res.json(voluntarios);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener voluntarios', error: err.message });
  }
});

router.post('/', auth, esAdmin, async (req, res) => {
  try {
    const voluntario = new Voluntario(req.body);
    await voluntario.save();
    res.status(201).json(voluntario);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al crear voluntario', error: err.message });
  }
});

router.put('/:id', auth, esAdmin, async (req, res) => {
  try {
    const voluntario = await Voluntario.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!voluntario) return res.status(404).json({ mensaje: 'Voluntario no encontrado' });
    res.json(voluntario);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al actualizar voluntario', error: err.message });
  }
});

router.delete('/:id', auth, esAdmin, async (req, res) => {
  try {
    const voluntario = await Voluntario.findByIdAndUpdate(req.params.id, { activo: false }, { new: true });
    if (!voluntario) return res.status(404).json({ mensaje: 'Voluntario no encontrado' });
    res.json({ mensaje: 'Voluntario desactivado', voluntario });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al desactivar voluntario', error: err.message });
  }
});

module.exports = router;