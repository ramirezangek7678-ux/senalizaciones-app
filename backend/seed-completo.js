/**
 * seed-completo.js — Puebla TODAS las colecciones de senalizaciones_db
 * Uso:  cd backend && node seed-completo.js
 * Requiere: MongoDB local corriendo (MONGO_URI del .env, p.ej. mongodb://localhost:27017/senalizaciones_db)
 *
 * Este script es AUTOCONTENIDO: inserta servicios, usuarios, trabajadores,
 * citas y pedidos, aunque la base esté completamente vacía.
 */
const mongoose = require('mongoose');
require('dotenv').config();

const Usuario = require('./models/Usuario');
const Servicio = require('./models/Servicio');
const Cita = require('./models/Cita');
const Pedido = require('./models/Pedido');
const Trabajador = require('./models/Trabajador');

// ─── SERVICIOS (20, tomados del seed.js original del proyecto) ───
const serviciosData = [
  // SEÑALAMIENTOS VIALES
  { nombre: 'Señales de Tránsito Reflectivas', descripcion: 'Fabricación e instalación de señales de tránsito con material reflectivo grado ingeniería o diamante. Incluye señales preventivas, restrictivas e informativas conforme a norma SCT.', duracionMinutos: 120, precio: 1800, categoria: 'señalamientos_viales' },
  { nombre: 'Pintura de Pavimento y Rayas Viales', descripcion: 'Aplicación de pintura termoplástica o de tráfico en pavimentos: rayas de carril, cebras peatonales, flechas direccionales, letras y símbolos en vialidades.', duracionMinutos: 180, precio: 3500, categoria: 'señalamientos_viales' },
  { nombre: 'Instalación de Topes y Reductores de Velocidad', descripcion: 'Suministro e instalación de topes de hule o concreto, vibradores y reductores de velocidad para zonas escolares, residenciales y estacionamientos.', duracionMinutos: 90, precio: 2200, categoria: 'señalamientos_viales' },
  { nombre: 'Señalización de Obras en Vía Pública', descripcion: 'Kit completo de señalización temporal para obras: conos, tambos, vallas, señales preventivas y luminarias para proteger zonas de trabajo en carreteras y calles.', duracionMinutos: 60, precio: 1500, categoria: 'señalamientos_viales' },
  { nombre: 'Postes y Estructuras para Señales', descripcion: 'Fabricación e instalación de postes galvanizados, tubulares o de perfil cuadrado para montaje de señales de tránsito, incluyendo cimentación.', duracionMinutos: 150, precio: 2800, categoria: 'señalamientos_viales' },
  // SEÑALAMIENTOS INDUSTRIALES
  { nombre: 'Señalización de Seguridad e Higiene', descripcion: 'Señales de obligación, prohibición, advertencia y emergencia para plantas industriales conforme a NOM-026-STPS. Incluye rutas de evacuación y puntos de reunión.', duracionMinutos: 120, precio: 2500, categoria: 'señalamientos_industriales' },
  { nombre: 'Demarcación de Áreas con Pintura Industrial', descripcion: 'Delimitación de áreas de trabajo, pasillos peatonales, zonas de carga, almacenes y áreas de riesgo con pintura epóxica de alto tráfico en pisos industriales.', duracionMinutos: 240, precio: 4500, categoria: 'señalamientos_industriales' },
  { nombre: 'Señalización de Tuberías y Ductos', descripcion: 'Identificación de tuberías industriales con código de colores, flechas de flujo y etiquetas según norma ANSI/ASME A13.1 para plantas de gas, agua, vapor y químicos.', duracionMinutos: 180, precio: 3200, categoria: 'señalamientos_industriales' },
  { nombre: 'Letreros de Prevención de Riesgos', descripcion: 'Fabricación de letreros personalizados para riesgos eléctricos, químicos, mecánicos y biológicos. Material en aluminio, vinilo o acrílico con impresión UV resistente.', duracionMinutos: 60, precio: 1200, categoria: 'señalamientos_industriales' },
  { nombre: 'Señalización de Extintores y Equipos de Emergencia', descripcion: 'Instalación de señales fotoluminiscentes para extintores, hidrantes, botiquines, duchas de emergencia y lavaojos conforme a normativa de protección civil.', duracionMinutos: 90, precio: 1600, categoria: 'señalamientos_industriales' },
  // SEÑALAMIENTOS COMERCIALES
  { nombre: 'Rotulación de Locales y Fachadas', descripcion: 'Diseño y fabricación de rótulos para negocios: letras en relieve, cajas de luz, lonas tensadas y viniles de corte para fachadas comerciales y centros comerciales.', duracionMinutos: 120, precio: 3800, categoria: 'señalamientos_comerciales' },
  { nombre: 'Señalización Interior de Tiendas y Oficinas', descripcion: 'Directorios, señales de áreas, números de locales, flechas direccionales y señalética corporativa para interiores de oficinas, hospitales, hoteles y centros comerciales.', duracionMinutos: 90, precio: 2600, categoria: 'señalamientos_comerciales' },
  { nombre: 'Viniles Decorativos y Publicidad en Vidrios', descripcion: 'Aplicación de viniles impresos, esmerilados, de colores o microperforados en vitrinas, ventanas y mamparas para publicidad, privacidad o decoración comercial.', duracionMinutos: 60, precio: 1400, categoria: 'señalamientos_comerciales' },
  { nombre: 'Señalización de Estacionamientos', descripcion: 'Numeración de cajones, señales de entrada/salida, flechas de circulación, zonas discapacitados, topes y pintura de pavimento para estacionamientos públicos y privados.', duracionMinutos: 180, precio: 3000, categoria: 'señalamientos_comerciales' },
  // CONSULTORÍA
  { nombre: 'Auditoría de Señalización Vial', descripcion: 'Diagnóstico completo del estado de señalización en vialidades, identificando señales dañadas, faltantes o incorrectas. Entrega de informe técnico con propuesta de mejora.', duracionMinutos: 120, precio: 2000, categoria: 'consultoria' },
  { nombre: 'Proyecto de Señalización Industrial (STPS)', descripcion: 'Elaboración del programa de señalización y comunicación de riesgos conforme a NOM-026-STPS para empresas que requieren cumplimiento ante inspecciones laborales.', duracionMinutos: 90, precio: 2400, categoria: 'consultoria' },
  { nombre: 'Asesoría en Normativa SCT y Protección Civil', descripcion: 'Consultoría especializada en normativas aplicables: SCT, STPS, NOM y reglamentos municipales. Orientación para trámites, permisos y cumplimiento legal.', duracionMinutos: 60, precio: 1000, categoria: 'consultoria' },
  // INSTALACIÓN
  { nombre: 'Instalación de Señales con Grúa o Canastilla', descripcion: 'Servicio de instalación de señales en altura, puentes peatonales, pasos a desnivel y estructuras elevadas utilizando equipo especializado con operador certificado.', duracionMinutos: 240, precio: 5500, categoria: 'instalacion' },
  { nombre: 'Mantenimiento y Reposición de Señales', descripcion: 'Servicio periódico de revisión, limpieza, reposición y actualización de señales deterioradas por vandalismo, accidentes o desgaste natural en vialidades o plantas.', duracionMinutos: 120, precio: 1800, categoria: 'instalacion' },
  { nombre: 'Instalación de Vialetas y Botones Reflectivos', descripcion: 'Suministro e instalación de vialetas (ojos de gato) reflectivas o bidireccionales en pavimentos para delimitación de carriles en carreteras y vialidades urbanas.', duracionMinutos: 150, precio: 2600, categoria: 'instalacion' }
];

const poblar = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB conectado a', process.env.MONGO_URI);

    // Limpiar TODAS las colecciones (para poder repetir el script sin duplicados)
    await Promise.all([
      Usuario.deleteMany({}),
      Servicio.deleteMany({}),
      Cita.deleteMany({}),
      Pedido.deleteMany({}),
      Trabajador.deleteMany({})
    ]);
    console.log('🗑️  Colecciones limpiadas');

    // Servicios (self-contained: funciona aunque la base esté vacía)
    const servicios = await Servicio.insertMany(serviciosData);
    console.log(`✅ ${servicios.length} servicios insertados`);

    // Usuarios
    const usuarios = await Usuario.insertMany([
      { nombre: 'Ana María López', email: 'ana.lopez@example.com', password: 'Password123', telefono: '55 1234 5678', empresa: 'Construcciones López SA de CV', rol: 'cliente' },
      { nombre: 'Carlos García Ruiz', email: 'carlos.garcia@example.com', password: 'Password123', telefono: '55 2345 6789', empresa: 'García Logística SA de CV', rol: 'cliente' },
      { nombre: 'Elena Hernández Vega', email: 'elena.hernandez@example.com', password: 'Password123', telefono: '55 3456 7890', empresa: 'Torres Vega SA de CV', rol: 'cliente' },
      { nombre: 'Admin SeñalPro', email: 'admin@senalpro.com', password: 'Admin123456', telefono: '55 0000 0000', empresa: 'SeñalPro', rol: 'admin' },
      { nombre: 'Empleado SeñalPro', email: 'empleado@senalpro.com', password: 'Empleado123', telefono: '55 1111 1111', empresa: 'SeñalPro', rol: 'empleado' }
    ]);
    console.log(`✅ ${usuarios.length} usuarios insertados`);

    // Trabajadores
    const trabajadores = await Trabajador.insertMany([
      { nombre: 'Pedro', apellidoPaterno: 'Sánchez', apellidoMaterno: 'Gómez', telefono: '55 3100 1100', email: 'pedro.sanchez@senalpro.com', puesto: 'Instalador Senior', area: 'instalacion', numeroEmpleado: 'EMP-001', fechaIngreso: new Date('2021-03-15') },
      { nombre: 'Laura', apellidoPaterno: 'Martínez', apellidoMaterno: 'Hernández', telefono: '55 3200 2200', email: 'laura.martinez@senalpro.com', puesto: 'Diseñadora Gráfica', area: 'diseño', numeroEmpleado: 'EMP-002', fechaIngreso: new Date('2022-01-10') },
      { nombre: 'Miguel', apellidoPaterno: 'Torres', telefono: '55 3300 3300', email: 'miguel.torres@senalpro.com', puesto: 'Ejecutivo de Ventas', area: 'ventas', numeroEmpleado: 'EMP-003', fechaIngreso: new Date('2023-05-02') }
    ]);
    console.log(`✅ ${trabajadores.length} trabajadores insertados`);

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

    // Pedidos (Pedido.create para respetar el hook pre('save') que genera numeroPedido)
    let pedidosCreados = 0;
    for (let i = 0; i < 5; i++) {
      const cliente = clientes[i % clientes.length];
      const servicio = servicios[(i + 2) % servicios.length];
      await Pedido.create({
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
      });
      pedidosCreados++;
    }
    console.log(`✅ ${pedidosCreados} pedidos insertados`);

    const resumen = await mongoose.connection.db.collections();
    console.log('\n📦 Colecciones en la base de datos:');
    for (const c of resumen) {
      const count = await c.countDocuments();
      console.log(`   - ${c.collectionName}: ${count} documentos`);
    }

    await mongoose.disconnect();
    console.log('\n🎉 Base de datos poblada exitosamente');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

poblar();
