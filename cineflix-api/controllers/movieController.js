const Movie = require("../models/Movie");

exports.getMovies = async (req, res, next) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (err) {
    next(err);
  }
};

exports.getMovieById = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: "No encontrado" });
    res.json(movie);
  } catch (err) {
    next(err);
  }
};

exports.createMovie = async (req, res, next) => {
  try {
    // Validar campos requeridos
    if (!req.body.title || !req.body.description || !req.body.genre || !req.body.posterUrl) {
      return res.status(400).json({ 
        success: false,
        message: "Faltan campos requeridos: título, descripción, género o póster"
      });
    }

    // Convertir género a array si es string
    if (typeof req.body.genre === 'string') {
      req.body.genre = req.body.genre.split(',').map(g => g.trim());
    }

    const movie = await Movie.create({
      title: req.body.title,
      description: req.body.description,
      genre: req.body.genre,
      year: req.body.year || null,
      director: req.body.director || '',
      posterUrl: req.body.posterUrl,
      trailerUrl: req.body.trailerUrl || '',
      cast: req.body.cast || [],
      duration: req.body.duration || null
    });

    res.status(201).json({
      success: true,
      data: movie
    });
  } catch (err) {
    next(err);
  }
};

exports.updateMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!movie) return res.status(404).json({ message: "No encontrado" });
    res.json(movie);
  } catch (err) {
    next(err);
  }
};

exports.deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).json({ message: "No encontrado" });
    res.json({ message: "Película eliminada" });
  } catch (err) {
    next(err);
  }
};
