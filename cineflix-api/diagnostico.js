// diagnostico.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

async function diagnosticar() {
  try {
    // 1. Verificar conexión a MongoDB
    console.log('1. Verificando conexión a MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conexión a MongoDB exitosa');
    
    // 2. Verificar variables de entorno
    console.log('\n2. Verificando variables de entorno...');
    console.log('JWT_SECRET está definido:', !!process.env.JWT_SECRET);
    console.log('MONGO_URI está definido:', !!process.env.MONGO_URI);
    
    if (!process.env.JWT_SECRET) {
      console.log('⚠️ JWT_SECRET no está definido. Este es necesario para la autenticación.');
      console.log('Cree un archivo .env con JWT_SECRET=tusecretoaqui');
    }
    
    // 3. Verificar usuario admin
    console.log('\n3. Verificando usuario admin...');
    const admin = await User.findOne({ role: 'admin' });
    
    if (admin) {
      console.log('✅ Usuario admin encontrado:');
      console.log(`Username: ${admin.username}`);
      console.log(`Email: ${admin.email || 'No definido'}`);
      console.log(`Activo: ${admin.isActive ? 'Sí' : 'No'}`);
      console.log(`Contraseña (hash): ${admin.password.substring(0, 20)}...`);
    } else {
      console.log('❌ No se encontró ningún usuario admin');
    }
    
    // 4. Verificar autenticación
    if (admin) {
      console.log('\n4. Probando autenticación para el admin...');
      // Intentamos con una contraseña de prueba
      const testPasswords = ['admin', 'Admin1234', 'admin123', 'password', 'Admin123!'];
      
      for (const testPassword of testPasswords) {
        const isMatch = await bcrypt.compare(testPassword, admin.password);
        console.log(`Contraseña "${testPassword}": ${isMatch ? '✅ Correcta' : '❌ Incorrecta'}`);
        
        if (isMatch) {
          console.log('\n✅ Autenticación exitosa para admin');
          console.log('Intentando generar token JWT...');
          
          try {
            const token = jwt.sign(
              { id: admin._id },
              process.env.JWT_SECRET,
              { expiresIn: '7d' }
            );
            console.log('✅ Token JWT generado correctamente');
            console.log('Token:', token);
            
            // Verificar token
            console.log('\nVerificando token...');
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('✅ Token verificado correctamente');
            console.log('Datos decodificados:', decoded);
          } catch (jwtError) {
            console.log('❌ Error al generar/verificar token JWT:', jwtError.message);
            console.log('⚠️ Esto indica un problema con JWT_SECRET o con jwt');
          }
          
          break;
        }
      }
    }
    
    // 5. Crear un usuario de prueba para verificar funcionalidad
    console.log('\n5. Creando usuario de prueba...');
    const testUsername = 'test_' + Date.now();
    const testPassword = 'Test123!';
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    
    const testUser = await User.create({
      username: testUsername,
      password: hashedPassword,
      name: 'Usuario de Prueba',
      email: `${testUsername}@test.com`,
      role: 'user',
      isActive: true
    });
    
    console.log('✅ Usuario de prueba creado:');
    console.log(`Username: ${testUser.username}`);
    console.log(`Password: ${testPassword}`);
    
    // Verificar autenticación con el nuevo usuario
    console.log('\nVerificando autenticación con usuario de prueba...');
    const isValidTest = await bcrypt.compare(testPassword, testUser.password);
    
    if (isValidTest) {
      console.log('✅ Autenticación exitosa para usuario de prueba');
      
      try {
        const token = jwt.sign(
          { id: testUser._id },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        );
        console.log('✅ Token JWT generado correctamente para usuario de prueba');
      } catch (jwtError) {
        console.log('❌ Error con JWT para usuario de prueba:', jwtError.message);
      }
    } else {
      console.log('❌ Autenticación fallida para usuario de prueba');
    }
    
    // Eliminar usuario de prueba
    await User.deleteOne({ _id: testUser._id });
    console.log('\n✅ Usuario de prueba eliminado');
    
    console.log('\n==========================================');
    console.log('RESULTADO DEL DIAGNÓSTICO:');
    
    // Mostrar resumen y soluciones
    if (!process.env.JWT_SECRET) {
      console.log('⚠️ PROBLEMA CRÍTICO: JWT_SECRET no está definido');
      console.log('SOLUCIÓN: Crea un archivo .env con JWT_SECRET=tusecreto');
    }
    
    if (!admin) {
      console.log('⚠️ No hay usuario administrador');
      console.log('SOLUCIÓN: Ejecuta un script para crear un admin');
    }
    
    console.log('\nPARA SOLUCIONAR PROBLEMAS DE AUTENTICACIÓN:');
    console.log('1. Verifica que JWT_SECRET esté definido correctamente en .env');
    console.log('2. Asegúrate de que bcryptjs sea la misma versión en todo el proyecto');
    console.log('3. Revisa los middlewares de autenticación');
    console.log('4. Verifica que frontend envíe username/email y password en formato correcto');
    
  } catch (error) {
    console.error('Error durante el diagnóstico:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconectado de MongoDB');
  }
}

diagnosticar();