const mongoose = require('mongoose');

const progresoPasoSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  completado: { type: Boolean, default: false },
  fecha: { type: Date, default: null },
  notas: { type: String, default: '' }
});

const pedidoSchema = new mongoose.Schema({
  numeroPedido: { type: String, unique: true },
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', default: null },
  nombre: { type: String, default: '' },
  apellidoPaterno: { type: String, default: '' },
  apellidoMaterno: { type: String, default: '' },
  telefono: { type: String, default: '' },
  email: { type: String, default: '' },
  empresa: { type: String, default: '' },
  servicio: { type: mongoose.Schema.Types.ObjectId, ref: 'Servicio', required: true },
  fecha: { type: Date, required: true },
  hora: { type: String, required: true },
  estado: {
    type: String,
    enum: ['pendiente', 'confirmada', 'en_proceso', 'completada', 'cancelada'],
    default: 'confirmada'
  },
  progreso: {
    type: [progresoPasoSchema],
    default: () => ([
      { titulo: 'Revisión inicial del sitio' },
      { titulo: 'Preparación de materiales' },
      { titulo: 'Ejecución del servicio' },
      { titulo: 'Control de calidad' },
      { titulo: 'Entrega al cliente' }
    ])
  },
  notas: { type: String, default: '' },
  notasAdmin: { type: String, default: '' },
  direccion: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Generar número de pedido automático tipo MS-2025-0001
pedidoSchema.pre('save', async function (next) {
  this.updatedAt = Date.now();
  if (!this.numeroPedido) {
    const año = new Date().getFullYear();
    const ultimo = await mongoose.model('Pedido').findOne(
      { numeroPedido: { $regex: `^MS-${año}-` } },
      {},
      { sort: { createdAt: -1 } }
    );
    let num = 1;
    if (ultimo && ultimo.numeroPedido) {
      const partes = ultimo.numeroPedido.split('-');
      num = parseInt(partes[2]) + 1;
    }
    this.numeroPedido = `MS-${año}-${String(num).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Pedido', pedidoSchema);
