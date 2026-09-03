const mongoose = require('mongoose');

const progresoPasoSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  completado: { type: Boolean, default: false },
  fecha: { type: Date, default: null },
  notas: { type: String, default: '' }
});

const donacionSchema = new mongoose.Schema({
  numeroDonacion: { type: String, unique: true },
  donante: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', default: null },
  nombre: { type: String, default: '' },
  apellidoPaterno: { type: String, default: '' },
  apellidoMaterno: { type: String, default: '' },
  telefono: { type: String, default: '' },
  email: { type: String, default: '' },
  organizacion: { type: String, default: '' },
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
  cantidad: { type: Number, required: true, default: 1 },
  unidad: { type: String, default: 'pieza' },
  fecha: { type: Date, required: true },
  hora: { type: String, required: true },
  estado: {
    type: String,
    enum: ['pendiente', 'confirmada', 'en_camino', 'entregada', 'cancelada'],
    default: 'confirmada'
  },
  progreso: {
    type: [progresoPasoSchema],
    default: () => ([
      { titulo: 'Donación registrada' },
      { titulo: 'Inspección y clasificación' },
      { titulo: 'Asignación a beneficiario' },
      { titulo: 'Entrega en ruta' },
      { titulo: 'Entrega completada' }
    ])
  },
  beneficiario: { type: String, default: '' },
  notas: { type: String, default: '' },
  notasAdmin: { type: String, default: '' },
  direccion: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

donacionSchema.pre('save', async function (next) {
  this.updatedAt = Date.now();
  if (!this.numeroDonacion) {
    const año = new Date().getFullYear();
    const ultimo = await mongoose.model('Donacion').findOne(
      { numeroDonacion: { $regex: `^DON-${año}-` } },
      {},
      { sort: { createdAt: -1 } }
    );
    let num = 1;
    if (ultimo && ultimo.numeroDonacion) {
      const partes = ultimo.numeroDonacion.split('-');
      num = parseInt(partes[2]) + 1;
    }
    this.numeroDonacion = `DON-${año}-${String(num).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Donacion', donacionSchema);