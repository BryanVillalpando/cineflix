const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');
const errorHandler = require('./middlewares/errorHandler');
const adminRoutes = require('./routes/adminRoutes');

// Cargar variables de entorno
dotenv.config();

// Inicializar app
const app = express();

console.log("Iniciando el servidor...");

connectDB()
  .then(() => {
    console.log("Conectado a MongoDB");

    // Middlewares
    app.use(cors());
    app.use(express.json());


    // Rutas principales
    app.use('/api/auth', authRoutes);
    app.use('/api/movies', movieRoutes);
    app.use('/api/admin', adminRoutes);


    // Ruta base
    app.get('/', (req, res) => {
      res.send('API de Cineflix funcionando 🎬');
    });

    // Manejo de errores
    app.use(errorHandler);
// Importar rutas de usuario
    const userRoutes = require('./routes/userRoutes');

// Usar rutas de usuario
    app.use('/api/users', userRoutes);
    // Puerto
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  })
  .catch(err => {
    console.error("Error al conectar a MongoDB:", err);
  });
