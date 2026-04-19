const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://admin:HAL04123@cluster0.aicpnxx.mongodb.net/senalizaciones?retryWrites=true&w=majority&appName=Cluster0';

const servicioSchema = new mongoose.Schema({
  nombre: String,
  descripcion: String,
  duracionMinutos: Number,
  precio: Number,
  categoria: String,
  activo: { type: Boolean, default: true },
  imagen: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const Servicio = mongoose.model('Servicio', servicioSchema);

const servicios = [
  // Señalamientos Viales
  {
    nombre: 'Señales de Tránsito Verticales',
    descripcion: 'Fabricación e instalación de señales verticales: alto, ceda el paso, velocidad máxima, prohibido estacionarse y más. Materiales reflectivos de alta duración.',
    duracionMinutos: 480,
    precio: 3500,
    categoria: 'señalamientos_viales'
  },
  {
    nombre: 'Pintura de Pavimento',
    descripcion: 'Marcado horizontal en pavimento: líneas de carril, cruces peatonales, flechas de circulación, zonas de no estacionamiento y letras en vialidades.',
    duracionMinutos: 360,
    precio: 4200,
    categoria: 'señalamientos_viales'
  },
  {
    nombre: 'Topes de Hule y Concreto',
    descripcion: 'Suministro e instalación de topes reductores de velocidad de hule o concreto con tachuelas reflectivas. Incluye señalización correspondiente.',
    duracionMinutos: 240,
    precio: 2800,
    categoria: 'señalamientos_viales'
  },
  {
    nombre: 'Señalización de Obras en Vía Pública',
    descripcion: 'Kit completo de señalización temporal para obras: conos, vallas, señales de desvío, lámparas intermitentes y personal de apoyo.',
    duracionMinutos: 120,
    precio: 5500,
    categoria: 'señalamientos_viales'
  },
  {
    nombre: 'Delineadores y Defensas Viales',
    descripcion: 'Instalación de delineadores plásticos, postes viales y defensas metálicas para canalizacion del tráfico en curvas y entradas.',
    duracionMinutos: 300,
    precio: 3200,
    categoria: 'señalamientos_viales'
  },

  // Señalamientos Industriales
  {
    nombre: 'Señalización de Seguridad Industrial',
    descripcion: 'Señales de obligación, prohibición, advertencia y emergencia para plantas industriales. Norma NOM-026-STPS. Incluye rutas de evacuación y puntos de reunión.',
    duracionMinutos: 480,
    precio: 6500,
    categoria: 'señalamientos_industriales'
  },
  {
    nombre: 'Demarcación de Áreas y Pasillos',
    descripcion: 'Pintura epóxica en pisos industriales para demarcación de pasillos, zonas de carga, áreas de trabajo y espacios restringidos.',
    duracionMinutos: 540,
    precio: 7800,
    categoria: 'señalamientos_industriales'
  },
  {
    nombre: 'Señalización de Equipos Contra Incendio',
    descripcion: 'Instalación de señales para extintores, hidrantes, mangueras, rociadores y zonas de peligro de incendio conforme a normativa.',
    duracionMinutos: 180,
    precio: 2500,
    categoria: 'señalamientos_industriales'
  },
  {
    nombre: 'Etiquetado de Tuberías',
    descripcion: 'Identificación y etiquetado de tuberías industriales por tipo de fluido, dirección de flujo y nivel de peligrosidad. Norma NOM-026-STPS.',
    duracionMinutos: 360,
    precio: 4500,
    categoria: 'señalamientos_industriales'
  },
  {
    nombre: 'Señalización de Almacenes y Bodegas',
    descripcion: 'Identificación de racks, zonas de almacenamiento, capacidades máximas, rutas de emergencia y señales de montacargas.',
    duracionMinutos: 420,
    precio: 5200,
    categoria: 'señalamientos_industriales'
  },

  // Señalamientos Comerciales
  {
    nombre: 'Señalización de Estacionamientos',
    descripcion: 'Numeración de cajones, señales de entrada y salida, flechas de circulación, zonas para discapacitados y pintura de pavimento.',
    duracionMinutos: 480,
    precio: 5800,
    categoria: 'señalamientos_comerciales'
  },
  {
    nombre: 'Señalética Interior de Locales',
    descripcion: 'Señalización interior para tiendas, oficinas y centros comerciales: directorios, flechas, nombres de áreas, sanitarios y salidas de emergencia.',
    duracionMinutos: 300,
    precio: 4000,
    categoria: 'señalamientos_comerciales'
  },
  {
    nombre: 'Rótulos y Letreros Exteriores',
    descripcion: 'Fabricación e instalación de rótulos comerciales en lona, acrílico, aluminio o vinil. Incluye diseño y montaje.',
    duracionMinutos: 360,
    precio: 6000,
    categoria: 'señalamientos_comerciales'
  },
  {
    nombre: 'Señalización para Restaurantes y Hoteles',
    descripcion: 'Señalética de categoría para establecimientos de servicio: menús, numeración de habitaciones, áreas de servicio y salidas de emergencia.',
    duracionMinutos: 240,
    precio: 3800,
    categoria: 'señalamientos_comerciales'
  },
  {
    nombre: 'Vinilado de Vehículos',
    descripcion: 'Aplicación de vinil adhesivo en unidades de flotilla: logotipos, datos de empresa, publicidad y señalización de seguridad.',
    duracionMinutos: 300,
    precio: 4500,
    categoria: 'señalamientos_comerciales'
  },

  // Consultoría
  {
    nombre: 'Auditoría de Señalización Vial',
    descripcion: 'Revisión y diagnóstico del estado actual de la señalización vial en vialidades o fraccionamientos. Entrega de informe con recomendaciones.',
    duracionMinutos: 240,
    precio: 3500,
    categoria: 'consultoria'
  },
  {
    nombre: 'Proyecto de Señalización Industrial',
    descripcion: 'Elaboración de proyecto ejecutivo de señalización para plantas industriales conforme a normas NOM-026-STPS y NOM-003-SEGOB.',
    duracionMinutos: 480,
    precio: 8500,
    categoria: 'consultoria'
  },
  {
    nombre: 'Capacitación en Señalización de Seguridad',
    descripcion: 'Curso presencial para personal sobre interpretación de señales de seguridad, rutas de evacuación y uso correcto de señalética industrial.',
    duracionMinutos: 180,
    precio: 4500,
    categoria: 'consultoria'
  },

  // Instalación
  {
    nombre: 'Mantenimiento de Señalización',
    descripcion: 'Revisión, limpieza, reposición y pintura de señalización existente. Ideal para vialidades privadas, fraccionamientos e industrias.',
    duracionMinutos: 360,
    precio: 3200,
    categoria: 'instalacion'
  },
  {
    nombre: 'Instalación de Semáforos y Balizas',
    descripcion: 'Suministro e instalación de semáforos solares, balizas LED y sistemas de alerta luminosa para vialidades privadas y accesos.',
    duracionMinutos: 480,
    precio: 12000,
    categoria: 'instalacion'
  }
];

async function seedServicios() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB conectado');

    const existentes = await Servicio.countDocuments();
    console.log(`📦 Servicios existentes: ${existentes}`);

    await Servicio.insertMany(servicios);
    console.log(`✅ ${servicios.length} servicios insertados exitosamente`);

    mongoose.disconnect();
    console.log('🎉 Listo');
  } catch (err) {
    console.error('❌ Error:', err.message);
    mongoose.disconnect();
  }
}

seedServicios();
