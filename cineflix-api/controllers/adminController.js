const User = require('../models/User');

exports.getUsers = async (req, res, next) => {
    try {
        const users = await User.find({}).select('-password');
        res.json({
            success: true,
            count: users.length,
            users // Envía como propiedad de un objeto
        });
    } catch (error) {
        next(error);
    }
};