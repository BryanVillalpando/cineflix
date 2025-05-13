const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  console.log("Headers:", req.headers);
  const token = req.headers.authorization?.split(" ")[1];
  console.log("Token extraído:", token);
  
  if (!token) {
    console.log("No se proporcionó token");
    return res.status(401).json({ message: "Token requerido" });
  }

  try {
    console.log("JWT_SECRET está definido:", !!process.env.JWT_SECRET);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token decodificado:", decoded);
    req.user = decoded.id;
    next();
  } catch (err) {
    console.log("Error al verificar token:", err.message);
    res.status(401).json({ message: "Token inválido" });
  }
};
exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({ message: 'Acceso denegado: se requiere rol de administrador' });
};