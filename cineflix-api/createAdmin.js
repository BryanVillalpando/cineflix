require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const adminExists = await User.findOne({ username: 'admin' });
  if (adminExists) {
    console.log('✅ El usuario admin ya existe');
    return;
  }

  const hashedPassword = await bcrypt.hash('Admin1234', 10);
  
  await User.create({
    username: 'admin',
    email: 'admin@cineflix.com',
    password: hashedPassword,
    name: 'Administrador',
    role: 'admin'
  });

  console.log('🛠️  Usuario admin creado:');
  console.log('👤 Usuario: admin');
  console.log('🔑 Contraseña: Admin1234');
  console.log('⚠️ Cambia esta contraseña después del primer acceso!');
}

createAdmin().then(() => process.exit());