const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/solicitudes', require('./routes/solicitudes'));
app.use('/api/donaciones', require('./routes/donaciones'));
app.use('/api/productos', require('./routes/productos'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/voluntarios', require('./routes/voluntarios'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => console.error('❌ Error MongoDB:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));