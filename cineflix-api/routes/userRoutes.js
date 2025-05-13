const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Obtener datos del usuario actual
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        
        // Asegúrate de devolver name, email y username
        res.json({
            id: user._id,
            username: user.username,
            name: user.name || '',
            email: user.email || '',
            createdAt: user.createdAt
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Actualizar perfil de usuario
router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const { name, email, currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user);
        
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Actualizar datos básicos
        if (name) user.name = name;
        if (email) user.email = email;

        // Actualizar contraseña si se proporcionó
        if (currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Contraseña actual incorrecta' });
            }
            user.password = await bcrypt.hash(newPassword, 10);
        }

        await user.save();
        
        // Excluir la contraseña en la respuesta
        const userResponse = user.toObject();
        delete userResponse.password;

        res.json({ message: 'Perfil actualizado', user: userResponse });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;