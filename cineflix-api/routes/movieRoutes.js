const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const auth = require('../middlewares/authMiddleware');
const admin = require('../middlewares/adminMiddleware');

// Ruta para CREAR películas
router.post('/', auth, admin, async (req, res) => {
    try {
        const movieData = {
            ...req.body,
            createdBy: req.user.id
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

// Ruta para ACTUALIZAR películas
router.put('/:id', auth, admin, async (req, res) => {
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
 * @route GET /api/movies
 * @desc Obtener todas las películas
 * @access Public (o Private si quieres que solo usuarios autenticados vean películas)
 */
router.get('/', async (req, res) => {
    try {
        const movies = await Movie.find({})
            .sort({ createdAt: -1 }); // Ordenar por más recientes primero
        
        res.json(movies);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener películas',
            error: error.message
        });
    }
});
/**
 * @route GET /api/movies/:id
 * @desc Obtener una película por ID
 * @access Public (o Private si prefieres)
 */
router.get('/:id', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        
        if (!movie) {
            return res.status(404).json({
                success: false,
                message: 'Película no encontrada'
            });
        }
        
        res.json(movie);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener película',
            error: error.message
        });
    }
});


module.exports = router;
