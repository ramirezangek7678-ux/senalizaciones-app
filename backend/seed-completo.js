const mongoose = require('mongoose');
require('dotenv').config();

const Usuario = require('./models/Usuario');
const Servicio = require('./models/Servicio');
const Cita = require('./models/Cita');
const Pedido = require('./models/Pedido');
const Trabajador = require('./models/Trabajador');

const poblar = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB conectado');

    // Limpiar colecciones
    await Promise.all([
      Usuario.deleteMany({}),
      Cita.deleteMany({}),
      Pedido.deleteMany({}),
      Trabajador.deleteMany({})
    ]);

    // Usuarios
    const usuarios = await Usuario.insertMany([
      { nombre: 'Ana María López', email: 'ana.lopez@example.com', password: 'Password123', telefono: '55 1234 5678', empresa: 'Construcciones López SA de CV', rol: 'cliente' },
      { nombre: 'Carlos Hernández', email: 'carlos.hernandez@example.com', password: 'Password123', telefono: '55 8765 4321', empresa: 'Grupo Industrial Delta', rol: 'cliente' },
      { nombre: 'María Fernanda Ruiz', email: 'maria.ruiz@example.com', password: 'Password123', telefono: '55 2233 4455', empresa: '', rol: 'cliente' },
      { nombre: 'Admin SeñalPro', email: 'admin@senalpro.com', password: 'Admin123456', telefono: '55 0000 0000', empresa: 'SeñalPro', rol: 'admin' },
      { nombre: 'Jorge Ramírez', email: 'jorge.ramirez@senalpro.com', password: 'Empleado123', telefono: '55 1111 2222', empresa: 'SeñalPro', rol: 'empleado' }
    ]);
    console.log(`✅ ${usuarios.length} usuarios insertados`);

    // Trabajadores
    const trabajadores = await Trabajador.insertMany([
      { nombre: 'Pedro', apellidoPaterno: 'Sánchez', apellidoMaterno: 'Gómez', telefono: '55 3100 1100', email: 'pedro.sanchez@senalpro.com', puesto: 'Instalador Senior', area: 'instalacion', numeroEmpleado: 'EMP-001', fechaIngreso: new Date('2021-03-15') },
      { nombre: 'Laura', apellidoPaterno: 'Martínez', apellidoMaterno: 'Hernández', telefono: '55 3200 2200', email: 'laura.martinez@senalpro.com', puesto: 'Diseñadora Gráfica', area: 'diseño', numeroEmpleado: 'EMP-002', fechaIngreso: new Date('2022-01-10') },
      { nombre: 'Miguel', apellidoPaterno: 'Torres', telefono: '55 3300 3300', email: 'miguel.torres@senalpro.com', puesto: 'Ejecutivo de Ventas', area: 'ventas', numeroEmpleado: 'EMP-003', fechaIngreso: new Date('2023-05-02') }
    ]);
    console.log(`✅ ${trabajadores.length} trabajadores insertados`);

    // Servicios (para citas y pedidos)
    const servicios = await Servicio.find({}).limit(6);
    const clientes = usuarios.filter(u => u.rol === 'cliente');

    // Citas
    const citasData = [];
    for (let i = 0; i < 6; i++) {
      const cliente = clientes[i % clientes.length];
      const servicio = servicios[i % servicios.length];
      citasData.push({
        cliente: cliente._id,
        nombre: cliente.nombre.split(' ')[0],
        apellidoPaterno: 'López',
        apellidoMaterno: 'Hernández',
        telefono: cliente.telefono,
        email: cliente.email,
        empresa: cliente.empresa,
        servicio: servicio._id,
        fecha: new Date('2026-10-15'),
        hora: '10:00',
        estado: ['confirmada', 'pendiente', 'en_proceso', 'completada', 'confirmada', 'pendiente'][i],
        direccion: 'Av. Reforma 123, Ciudad de México',
        notas: 'Se requiere acceso a azotea del edificio.'
      });
    }
    const citas = await Cita.insertMany(citasData);
    console.log(`✅ ${citas.length} citas insertadas`);

    // Pedidos
    const pedidos = [];
    for (let i = 0; i < 5; i++) {
      const cliente = clientes[i % clientes.length];
      const servicio = servicios[(i + 2) % servicios.length];
      pedidos.push(await Pedido.create({
        cliente: cliente._id,
        nombre: cliente.nombre.split(' ')[0],
        apellidoPaterno: 'García',
        apellidoMaterno: 'Pérez',
        telefono: cliente.telefono,
        email: cliente.email,
        empresa: cliente.empresa,
        servicio: servicio._id,
        fecha: new Date('2026-11-20'),
        hora: '09:00',
        estado: ['pendiente', 'confirmada', 'en_proceso', 'completada', 'cancelada'][i],
        direccion: 'Blvd. Aeropuerto 450, Querétaro'
      }));
    }
    console.log(`✅ ${pedidos.length} pedidos insertados`);

    const resumen = await mongoose.connection.db.collections();
    console.log('\n📦 Colecciones en senalizaciones_db:');
    for (const c of resumen) {
      const count = await c.countDocuments();
      console.log(`   - ${c.collectionName}: ${count} documentos`);
    }

    await mongoose.disconnect();
    console.log('\n🎉 Base de datos pobladada exitosamente');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

poblar();
