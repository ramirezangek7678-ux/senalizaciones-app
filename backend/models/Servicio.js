const mongoose = require('mongoose');

const servicioSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  descripcion: { type: String, required: true },
  duracionMinutos: { type: Number, required: true, default: 60 },
  precio: { type: Number, required: true },
  categoria: {
    type: String,
    enum: ['señalamientos_viales', 'señalamientos_industriales', 'señalamientos_comerciales', 'consultoria', 'instalacion', 'otro'],
    required: true
  },
  activo: { type: Boolean, default: true },
  imagen: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Servicio', servicioSchema);
