const express = require('express');
const pool = require('../db');
const verificarToken = require('../middleware/auth');

const router = express.Router();

router.get('/', verificarToken, async (req, res) => {
  try {
    const [filas] = await pool.query(
      'SELECT presupuesto_mensual FROM usuarios WHERE id = ?',
      [req.usuarioId]
    );
    res.json({ presupuesto: Number(filas[0].presupuesto_mensual) });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error del servidor', detalle: error.message });
  }
});

router.put('/', verificarToken, async (req, res) => {
  try {
    const presupuesto = Number(req.body.presupuesto);
    if (isNaN(presupuesto) || presupuesto < 0) {
      return res.status(400).json({ mensaje: 'Presupuesto inválido' });
    }
    await pool.query(
      'UPDATE usuarios SET presupuesto_mensual = ? WHERE id = ?',
      [presupuesto, req.usuarioId]
    );
    res.json({ mensaje: 'Presupuesto actualizado', presupuesto });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error del servidor', detalle: error.message });
  }
});

module.exports = router;