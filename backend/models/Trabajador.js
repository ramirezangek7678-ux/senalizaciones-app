const mongoose = require('mongoose');

const trabajadorSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  apellidoPaterno: { type: String, required: true, trim: true },
  apellidoMaterno: { type: String, default: '', trim: true },
  telefono: { type: String, required: true },
  email: { type: String, default: '', lowercase: true },
  puesto: { type: String, required: true },
  area: {
    type: String,
    enum: ['instalacion', 'ventas', 'diseño', 'administracion', 'otro'],
    default: 'instalacion'
  },
  numeroEmpleado: { type: String, unique: true, sparse: true },
  fechaIngreso: { type: Date, default: Date.now },
  activo: { type: Boolean, default: true },
  notas: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Trabajador', trabajadorSchema);
