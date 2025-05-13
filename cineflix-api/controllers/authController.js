const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
exports.register = async (req, res, next) => {
  try {
    const { username, password, name, email } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "El usuario o email ya están registrados",
        errorCode: "USER_EXISTS"
      });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Crear nuevo usuario
    const user = await User.create({
      username,
      password: hashedPassword,
      name,
      email,
      role: 'user',
      isActive: true
    });

    // Generar token y responder
    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({
      success: false,
      message: "Error al registrar usuario",
      errorCode: "REGISTRATION_ERROR"
    });
  }
};
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // 1. Buscar usuario por username o email
    const user = await User.findOne({ 
      $or: [{ username }, { email: username }] 
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Usuario no encontrado",
        errorCode: "USER_NOT_FOUND"
      });
    }

    // 2. Verificar si el usuario está activo
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Cuenta desactivada",
        errorCode: "ACCOUNT_INACTIVE"
      });
    }

    // 3. Comparar contraseñas
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Contraseña incorrecta",
        errorCode: "INVALID_PASSWORD"
      });
    }

    // 4. Generar token y responder
    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      errorCode: "SERVER_ERROR"
    });
  }
};