const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI).then(() => console.log('MongoDB conectado')).catch(e => process.exit(1));
const U = mongoose.model('Usuario', new mongoose.Schema({nombre:String,email:{type:String,unique:true},password:String,telefono:String,organizacion:String,rol:{type:String,default:'donante'},activo:{type:Boolean,default:true}}));
const P = mongoose.model('Producto', new mongoose.Schema({nombre:String,descripcion:String,unidad:String,categoria:String,meta:Number,activo:{type:Boolean,default:true}}));
setTimeout(async()=>{
  const h = await bcrypt.hash('admin123',10);
  await U.findOneAndUpdate({email:'admin@donaciones.com'},{nombre:'Administrador',email:'admin@donaciones.com',password:h,telefono:'477 000 0000',rol:'admin',activo:true},{upsert:true});
  await P.deleteMany({});
  await P.insertMany([
    {nombre:'Alimentos no perecederos',descripcion:'Arroz, frijol, lentejas, pasta, enlatados',unidad:'kg',categoria:'alimentos',meta:500},
    {nombre:'Ropa de invierno',descripcion:'Abrigos, suéteres, cobijas en buen estado',unidad:'pieza',categoria:'ropa',meta:300},
    {nombre:'Medicamentos básicos',descripcion:'Analgésicos, antiinflamatorios, vitaminas (sellados y en fecha)',unidad:'caja',categoria:'medicamentos',meta:100},
    {nombre:'Útiles escolares',descripcion:'Cuadernos, lápices, mochilas para niños en edad escolar',unidad:'kit',categoria:'escolar',meta:200},
    {nombre:'Productos de higiene',descripcion:'Jabón, shampoo, pasta dental, papel higiénico',unidad:'kit',categoria:'higiene',meta:250},
    {nombre:'Juguetes didácticos',descripcion:'Juegos de mesa, peluches, muñecas en buen estado',unidad:'pieza',categoria:'juguetes',meta:150}
  ]);
  console.log('LISTO - Email: admin@donaciones.com - Pass: admin123');
  process.exit(0);
},1500);