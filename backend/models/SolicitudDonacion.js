const mongoose = require('mongoose');

const solicitudDonacionSchema = new mongoose.Schema({
  numeroSolicitud: { type: String, unique: true },
  nombre: { type: String, required: true },
  apellidoPaterno: { type: String, required: true },
  telefono: { type: String, required: true },
  email: { type: String, default: '' },
  fecha: { type: Date, required: true },
  hora: { type: String, required: true },
  direccion: { type: String, default: '' },
  tipoDonacion: {
    type: String,
    enum: ['recoleccion', 'entrega'],
    default: 'recoleccion'
  },
  notas: { type: String, default: '' },
  estado: {
    type: String,
    enum: ['pendiente', 'confirmada', 'cancelada'],
    default: 'pendiente'
  },
  createdAt: { type: Date, default: Date.now }
});

solicitudDonacionSchema.pre('save', async function (next) {
  if (!this.numeroSolicitud) {
    const año = new Date().getFullYear();
    const ultimo = await mongoose.model('SolicitudDonacion').findOne(
      { numeroSolicitud: { $regex: `^SOL-${año}-` } },
      {},
      { sort: { createdAt: -1 } }
    );
    let num = 1;
    if (ultimo?.numeroSolicitud) {
      const partes = ultimo.numeroSolicitud.split('-');
      num = parseInt(partes[2]) + 1;
    }
    this.numeroSolicitud = `SOL-${año}-${String(num).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('SolicitudDonacion', solicitudDonacionSchema);