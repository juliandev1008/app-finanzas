const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

router.post('/registro', async (req, res) => {
  try {
    const { nombre, correo, contrasena } = req.body;
    if (!nombre || !correo || !contrasena) {
      return res.status(400).json({ mensaje: 'Faltan datos' });
    }
    const [existe] = await pool.query('SELECT id FROM usuarios WHERE correo = ?', [correo]);
    if (existe.length > 0) {
      return res.status(409).json({ mensaje: 'Ese correo ya está registrado' });
    }
    const hash = await bcrypt.hash(contrasena, 10);
        const [resultado] = await pool.query(
      'INSERT INTO usuarios (nombre, correo, contrasena) VALUES (?, ?, ?)',
      [nombre, correo, hash]
    );
    const categoriasBase = [
      ['Comida', '🍔'], ['Transporte', '🚌'], ['Diversión', '🎮'],
      ['Salud', '💊'], ['Hogar', '🏠'], ['Ingresos', '💵'], ['Otros', '📦']
    ];
    for (const [nombreCat, icono] of categoriasBase) {
      await pool.query(
        'INSERT INTO categorias (usuario_id, nombre, icono) VALUES (?, ?, ?)',
        [resultado.insertId, nombreCat, icono]
      );
    }

    res.status(201).json({ mensaje: 'Usuario creado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error del servidor', detalle: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { correo, contrasena } = req.body;
    const [filas] = await pool.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
    if (filas.length === 0) {
      return res.status(401).json({ mensaje: 'Correo o contraseña incorrectos' });
    }
    const usuario = filas[0];
    const coincide = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!coincide) {
      return res.status(401).json({ mensaje: 'Correo o contraseña incorrectos' });
    }
    const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, usuario: { id: usuario.id, nombre: usuario.nombre } });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error del servidor', detalle: error.message });
  }
});

module.exports = router;