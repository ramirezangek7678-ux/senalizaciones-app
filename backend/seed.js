const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => { console.error(err); process.exit(1); });

const Servicio = require('./models/Servicio');

const servicios = [
  // SEÑALAMIENTOS VIALES
  {
    nombre: 'Señales de Tránsito Reflectivas',
    descripcion: 'Fabricación e instalación de señales de tránsito con material reflectivo grado ingeniería o diamante. Incluye señales preventivas, restrictivas e informativas conforme a norma SCT.',
    duracionMinutos: 120,
    precio: 1800,
    categoria: 'señalamientos_viales'
  },
  {
    nombre: 'Pintura de Pavimento y Rayas Viales',
    descripcion: 'Aplicación de pintura termoplástica o de tráfico en pavimentos: rayas de carril, cebras peatonales, flechas direccionales, letras y símbolos en vialidades.',
    duracionMinutos: 180,
    precio: 3500,
    categoria: 'señalamientos_viales'
  },
  {
    nombre: 'Instalación de Topes y Reductores de Velocidad',
    descripcion: 'Suministro e instalación de topes de hule o concreto, vibradores y reductores de velocidad para zonas escolares, residenciales y estacionamientos.',
    duracionMinutos: 90,
    precio: 2200,
    categoria: 'señalamientos_viales'
  },
  {
    nombre: 'Señalización de Obras en Vía Pública',
    descripcion: 'Kit completo de señalización temporal para obras: conos, tambos, vallas, señales preventivas y luminarias para proteger zonas de trabajo en carreteras y calles.',
    duracionMinutos: 60,
    precio: 1500,
    categoria: 'señalamientos_viales'
  },
  {
    nombre: 'Postes y Estructuras para Señales',
    descripcion: 'Fabricación e instalación de postes galvanizados, tubulares o de perfil cuadrado para montaje de señales de tránsito, incluyendo cimentación.',
    duracionMinutos: 150,
    precio: 2800,
    categoria: 'señalamientos_viales'
  },

  // SEÑALAMIENTOS INDUSTRIALES
  {
    nombre: 'Señalización de Seguridad e Higiene',
    descripcion: 'Señales de obligación, prohibición, advertencia y emergencia para plantas industriales conforme a NOM-026-STPS. Incluye rutas de evacuación y puntos de reunión.',
    duracionMinutos: 120,
    precio: 2500,
    categoria: 'señalamientos_industriales'
  },
  {
    nombre: 'Demarcación de Áreas con Pintura Industrial',
    descripcion: 'Delimitación de áreas de trabajo, pasillos peatonales, zonas de carga, almacenes y áreas de riesgo con pintura epóxica de alto tráfico en pisos industriales.',
    duracionMinutos: 240,
    precio: 4500,
    categoria: 'señalamientos_industriales'
  },
  {
    nombre: 'Señalización de Tuberías y Ductos',
    descripcion: 'Identificación de tuberías industriales con código de colores, flechas de flujo y etiquetas según norma ANSI/ASME A13.1 para plantas de gas, agua, vapor y químicos.',
    duracionMinutos: 180,
    precio: 3200,
    categoria: 'señalamientos_industriales'
  },
  {
    nombre: 'Letreros de Prevención de Riesgos',
    descripcion: 'Fabricación de letreros personalizados para riesgos eléctricos, químicos, mecánicos y biológicos. Material en aluminio, vinilo o acrílico con impresión UV resistente.',
    duracionMinutos: 60,
    precio: 1200,
    categoria: 'señalamientos_industriales'
  },
  {
    nombre: 'Señalización de Extintores y Equipos de Emergencia',
    descripcion: 'Instalación de señales fotoluminiscentes para extintores, hidrantes, botiquines, duchas de emergencia y lavaojos conforme a normativa de protección civil.',
    duracionMinutos: 90,
    precio: 1600,
    categoria: 'señalamientos_industriales'
  },

  // SEÑALAMIENTOS COMERCIALES
  {
    nombre: 'Rotulación de Locales y Fachadas',
    descripcion: 'Diseño y fabricación de rótulos para negocios: letras en relieve, cajas de luz, lonas tensadas y viniles de corte para fachadas comerciales y centros comerciales.',
    duracionMinutos: 120,
    precio: 3800,
    categoria: 'señalamientos_comerciales'
  },
  {
    nombre: 'Señalización Interior de Tiendas y Oficinas',
    descripcion: 'Directorios, señales de áreas, números de locales, flechas direccionales y señalética corporativa para interiores de oficinas, hospitales, hoteles y centros comerciales.',
    duracionMinutos: 90,
    precio: 2600,
    categoria: 'señalamientos_comerciales'
  },
  {
    nombre: 'Viniles Decorativos y Publicidad en Vidrios',
    descripcion: 'Aplicación de viniles impresos, esmerilados, de colores o microperforados en vitrinas, ventanas y mamparas para publicidad, privacidad o decoración comercial.',
    duracionMinutos: 60,
    precio: 1400,
    categoria: 'señalamientos_comerciales'
  },
  {
    nombre: 'Señalización de Estacionamientos',
    descripcion: 'Numeración de cajones, señales de entrada/salida, flechas de circulación, zonas discapacitados, topes y pintura de pavimento para estacionamientos públicos y privados.',
    duracionMinutos: 180,
    precio: 3000,
    categoria: 'señalamientos_comerciales'
  },

  // CONSULTORÍA
  {
    nombre: 'Auditoría de Señalización Vial',
    descripcion: 'Diagnóstico completo del estado de señalización en vialidades, identificando señales dañadas, faltantes o incorrectas. Entrega de informe técnico con propuesta de mejora.',
    duracionMinutos: 120,
    precio: 2000,
    categoria: 'consultoria'
  },
  {
    nombre: 'Proyecto de Señalización Industrial (STPS)',
    descripcion: 'Elaboración del programa de señalización y comunicación de riesgos conforme a NOM-026-STPS para empresas que requieren cumplimiento ante inspecciones laborales.',
    duracionMinutos: 90,
    precio: 2400,
    categoria: 'consultoria'
  },
  {
    nombre: 'Asesoría en Normativa SCT y Protección Civil',
    descripcion: 'Consultoría especializada en normativas aplicables: SCT, STPS, NOM y reglamentos municipales. Orientación para trámites, permisos y cumplimiento legal.',
    duracionMinutos: 60,
    precio: 1000,
    categoria: 'consultoria'
  },

  // INSTALACIÓN
  {
    nombre: 'Instalación de Señales con Grúa o Canastilla',
    descripcion: 'Servicio de instalación de señales en altura, puentes peatonales, pasos a desnivel y estructuras elevadas utilizando equipo especializado con operador certificado.',
    duracionMinutos: 240,
    precio: 5500,
    categoria: 'instalacion'
  },
  {
    nombre: 'Mantenimiento y Reposición de Señales',
    descripcion: 'Servicio periódico de revisión, limpieza, reposición y actualización de señales deterioradas por vandalismo, accidentes o desgaste natural en vialidades o plantas.',
    duracionMinutos: 120,
    precio: 1800,
    categoria: 'instalacion'
  },
  {
    nombre: 'Instalación de Vialetas y Botones Reflectivos',
    descripcion: 'Suministro e instalación de vialetas (ojos de gato) reflectivas o bidireccionales en pavimentos para delimitación de carriles en carreteras y vialidades urbanas.',
    duracionMinutos: 150,
    precio: 2600,
    categoria: 'instalacion'
  },
];

const seed = async () => {
  try {
    await Servicio.deleteMany({});
    console.log('🗑️  Servicios anteriores eliminados');
    await Servicio.insertMany(servicios);
    console.log(`✅ ${servicios.length} servicios insertados correctamente`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

seed();
