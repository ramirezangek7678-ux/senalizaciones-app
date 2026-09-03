const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  descripcion: { type: String, required: true },
  unidad: { type: String, required: true, default: 'pieza' },
  categoria: {
    type: String,
    enum: ['alimentos', 'ropa', 'medicamentos', 'juguetes', 'higiene', 'escolar', 'otro'],
    required: true
  },
  meta: { type: Number, default: 0 },
  imagen: { type: String, default: '' },
  activo: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Producto', productoSchema);