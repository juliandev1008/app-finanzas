const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const cabecera = req.headers.authorization;
  if (!cabecera) {
    return res.status(401).json({ mensaje: 'No autorizado' });
  }
  const token = cabecera.split(' ')[1];
  try {
    const datos = jwt.verify(token, process.env.JWT_SECRET);
    req.usuarioId = datos.id;
    next();
  } catch (error) {
    res.status(401).json({ mensaje: 'Sesión inválida o vencida' });
  }
};