const router = require('express').Router();
const Producto = require('../models/Producto');
const { auth, esAdmin } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { categoria } = req.query;
    const filtro = req.query.todos === "true" ? {} : { activo: true };
    if (categoria) filtro.categoria = categoria;
    const productos = await Producto.find(filtro).sort({ nombre: 1 });
    res.json(productos);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener productos', error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.json(producto);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener producto', error: err.message });
  }
});

router.post('/', auth, esAdmin, async (req, res) => {
  try {
    const producto = new Producto(req.body);
    await producto.save();
    res.status(201).json(producto);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al crear producto', error: err.message });
  }
});

router.put('/:id', auth, esAdmin, async (req, res) => {
  try {
    const producto = await Producto.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.json(producto);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al actualizar producto', error: err.message });
  }
});

router.delete('/:id', auth, esAdmin, async (req, res) => {
  try {
    const producto = await Producto.findByIdAndUpdate(req.params.id, { activo: false }, { new: true });
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.json({ mensaje: 'Producto desactivado', producto });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al eliminar producto', error: err.message });
  }
});

module.exports = router;