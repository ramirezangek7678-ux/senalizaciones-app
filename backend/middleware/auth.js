const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ mensaje: 'Token requerido' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findById(decoded.id).select('-password');
    if (!usuario || !usuario.activo)
      return res.status(401).json({ mensaje: 'Token inválido' });

    req.usuario = usuario;
    next();
  } catch (err) {
    res.status(401).json({ mensaje: 'Token inválido o expirado' });
  }
};

const esAdmin = (req, res, next) => {
  if (req.usuario.rol !== 'admin')
    return res.status(403).json({ mensaje: 'Acceso denegado: se requiere rol admin' });
  next();
};

const esAdminOEmpleado = (req, res, next) => {
  if (req.usuario.rol !== 'admin' && req.usuario.rol !== 'empleado')
    return res.status(403).json({ mensaje: 'Acceso denegado' });
  next();
};

module.exports = { auth, esAdmin, esAdminOEmpleado };
