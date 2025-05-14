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

/**
 * @route GET /api/movies
 * @desc Obtener películas con filtros
 * @access Public
 */
router.get('/', async (req, res) => {
    try {
        const { limit, sort, genre } = req.query;
        let query = {};
        
        if (genre) {
            query.genre = { $regex: genre, $options: 'i' };
        }

        let dbQuery = Movie.find(query);
        
        if (sort) {
            dbQuery = dbQuery.sort(sort);
        }
        
        if (limit) {
            dbQuery = dbQuery.limit(parseInt(limit));
        }

        const movies = await dbQuery.exec();
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
 * @route GET /api/movies/search
 * @desc Buscar películas por título o género
 * @access Public
 */
router.get('/search', async (req, res) => {
    try {
        const { query, genre } = req.query;
        
        if (!query && !genre) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar un término de búsqueda o género'
            });
        }

        const searchConditions = [];
        
        if (query) {
            searchConditions.push({
                $or: [
                    { title: { $regex: query, $options: 'i' } },
                    { genre: { $regex: query, $options: 'i' } }
                ]
            });
        }
        
        if (genre) {
            searchConditions.push({
                genre: { $regex: genre, $options: 'i' }
            });
        }

        const movies = await Movie.find(
            searchConditions.length > 0 ? { $and: searchConditions } : {}
        );

        res.json({
            success: true,
            count: movies.length,
            data: movies
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al buscar películas',
            error: error.message
        });
    }
});
module.exports = router;
