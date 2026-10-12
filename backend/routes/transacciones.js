const express = require('express');
const pool = require('../db');
const verificarToken = require('../middleware/auth');

const router = express.Router();

// Ver todas las transacciones del usuario
router.get('/', verificarToken, async (req, res) => {
  try {
    const [filas] = await pool.query(
      `SELECT t.id, t.tipo, t.monto, t.descripcion, t.fecha, t.categoria_id,
              c.nombre AS categoria, c.icono
       FROM transacciones t
       JOIN categorias c ON c.id = t.categoria_id
       WHERE t.usuario_id = ?
       ORDER BY t.fecha DESC, t.id DESC`,
      [req.usuarioId]
    );
    res.json(filas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error del servidor', detalle: error.message });
  }
});

// Crear
router.post('/', verificarToken, async (req, res) => {
  try {
    const { categoria_id, tipo, monto, descripcion, fecha } = req.body;
    if (!categoria_id || !tipo || !monto || !fecha) {
      return res.status(400).json({ mensaje: 'Faltan datos' });
    }
    await pool.query(
      `INSERT INTO transacciones (usuario_id, categoria_id, tipo, monto, descripcion, fecha)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.usuarioId, categoria_id, tipo, monto, descripcion || null, fecha]
    );
    res.status(201).json({ mensaje: 'Transacción guardada' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error del servidor', detalle: error.message });
  }
});

// Editar
router.put('/:id', verificarToken, async (req, res) => {
  try {
    const { categoria_id, tipo, monto, descripcion, fecha } = req.body;
    await pool.query(
      `UPDATE transacciones
       SET categoria_id = ?, tipo = ?, monto = ?, descripcion = ?, fecha = ?
       WHERE id = ? AND usuario_id = ?`,
      [categoria_id, tipo, monto, descripcion || null, fecha, req.params.id, req.usuarioId]
    );
    res.json({ mensaje: 'Transacción actualizada' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error del servidor', detalle: error.message });
  }
});

// Eliminar
router.delete('/:id', verificarToken, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM transacciones WHERE id = ? AND usuario_id = ?',
      [req.params.id, req.usuarioId]
    );
    res.json({ mensaje: 'Transacción eliminada' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error del servidor', detalle: error.message });
  }
});

module.exports = router;