const express = require('express');
const pool = require('../db');
const verificarToken = require('../middleware/auth');

const router = express.Router();

router.get('/', verificarToken, async (req, res) => {
  try {
    const [filas] = await pool.query(
      'SELECT id, nombre, icono FROM categorias WHERE usuario_id = ?',
      [req.usuarioId]
    );
    res.json(filas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error del servidor', detalle: error.message });
  }
});

module.exports = router;