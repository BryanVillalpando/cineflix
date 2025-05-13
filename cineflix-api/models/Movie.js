const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  genre: { type: [String], required: true },
  year: { type: Number },
  director: { type: String },
  cast: { type: [String] },
  duration: { type: Number }, // en minutos
  posterUrl: { type: String, required: true },
  trailerUrl: { type: String },
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Movie', movieSchema);