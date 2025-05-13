const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    // 1. Verificar que el usuario esté autenticado
    if (!req.user) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    // 2. Obtener el usuario completo desde la base de datos
    const user = await User.findById(req.user);
    
    // 3. Verificar permisos de administrador
    if (!user || user.role !== 'admin' || !user.isActive) {
      return res.status(403).json({ 
        success: false,
        message: 'Acceso denegado: Se requieren privilegios de administrador',
        errorCode: 'ADMIN_ACCESS_DENIED'
      });
    }
    
    // 4. Adjuntar información del admin al request
    req.admin = {
      id: user._id,
      username: user.username,
      permissions: ['manage_movies', 'manage_users']
    };
    
    next();
  } catch (error) {
    console.error('Error en adminMiddleware:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error interno al verificar permisos',
      errorCode: 'ADMIN_CHECK_ERROR'
    });
  }
};