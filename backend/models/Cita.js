const mongoose = require('mongoose');

const progresoPasoSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  completado: { type: Boolean, default: false },
  fecha: { type: Date, default: null },
  notas: { type: String, default: '' }
});

const citaSchema = new mongoose.Schema({
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', default: null },
  // Datos del cliente sin sufijo
  nombre: { type: String, default: '' },
  apellidoPaterno: { type: String, default: '' },
  apellidoMaterno: { type: String, default: '' },
  telefono: { type: String, default: '' },
  email: { type: String, default: '' },
  empresa: { type: String, default: '' },
  // Cita
  servicio: { type: mongoose.Schema.Types.ObjectId, ref: 'Servicio', required: true },
  fecha: { type: Date, required: true },
  hora: { type: String, required: true },
  estado: {
    type: String,
    enum: ['pendiente', 'confirmada', 'en_proceso', 'completada', 'cancelada'],
    default: 'confirmada'
  },
  // Barra de progreso del trabajo
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

citaSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Cita', citaSchema);
