const mongoose = require('mongoose');

const voluntarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  apellidoPaterno: { type: String, required: true, trim: true },
  apellidoMaterno: { type: String, default: '', trim: true },
  telefono: { type: String, required: true },
  email: { type: String, default: '', lowercase: true },
  funcion: { type: String, required: true },
  area: {
    type: String,
    enum: ['recoleccion', 'clasificacion', 'entrega', 'logistica', 'administracion', 'otro'],
    default: 'recoleccion'
  },
  numeroVoluntario: { type: String, unique: true, sparse: true },
  fechaIngreso: { type: Date, default: Date.now },
  activo: { type: Boolean, default: true },
  notas: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Voluntario', voluntarioSchema);