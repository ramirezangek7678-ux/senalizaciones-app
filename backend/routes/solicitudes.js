const express = require('express');
const router = express.Router();
const SolicitudDonacion = require('../models/SolicitudDonacion');
const { auth, esAdminOVoluntario } = require('../middleware/auth');

router.post('/', async (req, res) => {
  try {
    const { nombre, apellidoPaterno, telefono, email, fecha, hora, direccion, tipoDonacion, notas } = req.body;
    if (!nombre || !apellidoPaterno || !telefono || !fecha || !hora)
      return res.status(400).json({ mensaje: 'Nombre, apellido, teléfono, fecha y hora son requeridos' });

    const solicitud = new SolicitudDonacion({
      nombre, apellidoPaterno, telefono, email: email || '',
      fecha, hora, direccion: direccion || '',
      tipoDonacion: tipoDonacion || 'recoleccion',
      notas: notas || ''
    });
    await solicitud.save();
    res.status(201).json({ mensaje: 'Solicitud registrada exitosamente', numeroSolicitud: solicitud.numeroSolicitud, solicitud });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al registrar solicitud', error: err.message });
  }
});

router.get('/', auth, esAdminOVoluntario, async (req, res) => {
  try {
    const solicitudes = await SolicitudDonacion.find().sort({ fecha: 1, hora: 1 });
    res.json(solicitudes);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener solicitudes' });
  }
});

router.put('/:id', auth, esAdminOVoluntario, async (req, res) => {
  try {
    const solicitud = await SolicitudDonacion.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!solicitud) return res.status(404).json({ mensaje: 'Solicitud no encontrada' });
    res.json(solicitud);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al actualizar solicitud' });
  }
});

router.delete('/:id', auth, esAdminOVoluntario, async (req, res) => {
  try {
    await SolicitudDonacion.findByIdAndDelete(req.params.id);
    res.json({ mensaje: 'Solicitud eliminada' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al eliminar solicitud' });
  }
});

router.get('/rastrear/:numero', async (req, res) => {
  try {
    const solicitud = await SolicitudDonacion.findOne({ numeroSolicitud: req.params.numero.toUpperCase() });
    if (!solicitud) return res.status(404).json({ mensaje: 'Solicitud no encontrada' });
    res.json(solicitud);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al rastrear solicitud' });
  }
});

module.exports = router;