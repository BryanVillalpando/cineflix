const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const admin = require('../middlewares/adminMiddleware');
const Movie = require('../models/Movie');
const User = require('../models/User');

// ======================================
// Rutas para Administración de Películas
// ======================================

/**
 * @route POST /admin/movies
 * @desc Crear nueva película
 * @access Private (Admin only)
 */
router.post('/movies', auth, admin, async (req, res) => {
  try {
    const movieData = {
      ...req.body,
      createdBy: req.admin.id
    };

    const movie = await Movie.create(movieData);
    
    res.status(201).json({
      success: true,
      data: movie,
      message: 'Película creada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear película',
      error: error.message
    });
  }
});

/**
 * @route PUT /admin/movies/:id
 * @desc Actualizar película existente
 * @access Private (Admin only)
 */
router.put('/movies/:id', auth, admin, async (req, res) => {
  try {
    const updatedMovie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedMovie) {
      return res.status(404).json({
        success: false,
        message: 'Película no encontrada'
      });
    }

    res.json({
      success: true,
      data: updatedMovie,
      message: 'Película actualizada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar película',
      error: error.message
    });
  }
});

/**
 * @route DELETE /admin/movies/:id
 * @desc Eliminar película
 * @access Private (Admin only)
 */
router.delete('/movies/:id', auth, admin, async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Película no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Película eliminada correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar película',
      error: error.message
    });
  }
});


// ===================================
// Rutas para Administración de Usuarios
// ===================================

/**
 * @route GET /admin/users
 * @desc Obtener todos los usuarios
 * @access Private (Admin only)
 */
router.get('/users', auth, admin, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password -__v')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      error: error.message
    });
  }
});

/**
 * @route PUT /admin/users/:id/status
 * @desc Cambiar estado de usuario (activar/desactivar)
 * @access Private (Admin only)
 */
router.put('/users/:id/status', auth, admin, async (req, res) => {
  try {
    const { isActive } = req.body;
    
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'El campo isActive debe ser un booleano'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password -__v');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: user,
      message: `Usuario ${isActive ? 'activado' : 'desactivado'} exitosamente`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado de usuario',
      error: error.message
    });
  }
});

/**
 * @route PUT /admin/users/:id/role
 * @desc Cambiar rol de usuario
 * @access Private (Admin only)
 */
router.put('/users/:id/role', auth, admin, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Rol no válido'
      });
    }

    // Evitar que el admin actual se quite sus propios privilegios
    if (req.params.id === req.admin.id && role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'No puedes cambiar tu propio rol de administrador'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password -__v');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: user,
      message: `Rol de usuario actualizado a ${role}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al cambiar rol de usuario',
      error: error.message
    });
  }
});
/**
 * @route DELETE /admin/users/:id
 * @desc Eliminar usuario
 * @access Private (Admin only)
 */
router.delete('/users/:id', auth, admin, async (req, res) => {
    try {
        // Evitar que el admin se elimine a sí mismo
        if (req.params.id === req.admin.id) {
            return res.status(400).json({
                success: false,
                message: 'No puedes eliminarte a ti mismo'
            });
        }

        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Usuario eliminado correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar usuario',
            error: error.message
        });
    }
});
module.exports = router;