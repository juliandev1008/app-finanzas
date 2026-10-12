const express = require('express');
const pool = require('./db');

const app = express();
const PUERTO = 3000;

app.get('/', (req, res) => {
  res.send('¡Hola! Mi app de finanzas ya está viva 🎉');
});

app.get('/api/prueba-bd', async (req, res) => {
  try {
    const [filas] = await pool.query('SELECT COUNT(*) AS total FROM usuarios');
    res.json({ mensaje: 'Conexión con MySQL exitosa ✅', usuarios: filas[0].total });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al conectar con la BD', detalle: error.message });
  }
});

app.listen(PUERTO, () => {
  console.log('Servidor corriendo en http://localhost:' + PUERTO);
});