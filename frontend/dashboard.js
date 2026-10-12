const API = 'http://localhost:3000/api';
const token = localStorage.getItem('token');
const usuario = JSON.parse(localStorage.getItem('usuario'));

if (!token || !usuario) {
  window.location.href = 'index.html';
}

const cabeceras = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer ' + token
};

document.getElementById('saludo').textContent = 'Hola, ' + usuario.nombre + ' 👋';
document.getElementById('fecha').value = new Date().toLocaleDateString('en-CA');

document.getElementById('btnSalir').onclick = () => {
  localStorage.clear();
  window.location.href = 'index.html';
};

function dinero(numero) {
  return '$' + Number(numero).toLocaleString('es-CO');
}

async function pedir(ruta, opciones = {}) {
  const respuesta = await fetch(API + ruta, { headers: cabeceras, ...opciones });
  if (respuesta.status === 401) {
    localStorage.clear();
    window.location.href = 'index.html';
  }
  return respuesta;
}

async function cargarCategorias() {
  const respuesta = await pedir('/categorias');
  const categorias = await respuesta.json();
  const select = document.getElementById('categoria');
  select.innerHTML = '';
  categorias.forEach(c => {
    const opcion = document.createElement('option');
    opcion.value = c.id;
    opcion.textContent = c.icono + ' ' + c.nombre;
    select.appendChild(opcion);
  });
}

async function cargarTransacciones() {
  const respuesta = await pedir('/transacciones');
  const transacciones = await respuesta.json();
  const lista = document.getElementById('lista');
  lista.innerHTML = '';

  let ingresos = 0;
  let gastos = 0;

  if (transacciones.length === 0) {
    lista.innerHTML = '<p class="vacio">Aún no tienes movimientos. ¡Registra el primero!</p>';
  }

  transacciones.forEach(t => {
    const monto = Number(t.monto);
    if (t.tipo === 'ingreso') ingresos += monto; else gastos += monto;

    const fila = document.createElement('div');
    fila.className = 'item';

    const icono = document.createElement('span');
    icono.className = 'icono';
    icono.textContent = t.icono || '📦';

    const info = document.createElement('div');
    info.className = 'info';
    const titulo = document.createElement('div');
    titulo.textContent = t.descripcion || t.categoria;
    const detalle = document.createElement('small');
    detalle.textContent = t.categoria + ' · ' + t.fecha;
    info.append(titulo, detalle);

    const valor = document.createElement('span');
    valor.className = 'valor ' + t.tipo;
    valor.textContent = (t.tipo === 'gasto' ? '-' : '+') + dinero(monto);

    const borrar = document.createElement('button');
    borrar.textContent = '🗑️';
    borrar.onclick = () => eliminar(t.id);

    fila.append(icono, info, valor, borrar);
    lista.appendChild(fila);
  });

  document.getElementById('totalIngresos').textContent = dinero(ingresos);
  document.getElementById('totalGastos').textContent = dinero(gastos);
  document.getElementById('balance').textContent = dinero(ingresos - gastos);
  refrescarAvatar();
}

async function eliminar(id) {
  if (!confirm('¿Eliminar este movimiento?')) return;
  await pedir('/transacciones/' + id, { method: 'DELETE' });
  cargarTransacciones();
}

document.getElementById('formTransaccion').onsubmit = async (e) => {
  e.preventDefault();
  await pedir('/transacciones', {
    method: 'POST',
    body: JSON.stringify({
      tipo: document.getElementById('tipo').value,
      categoria_id: document.getElementById('categoria').value,
      monto: document.getElementById('monto').value,
      descripcion: document.getElementById('descripcion').value,
      fecha: document.getElementById('fecha').value
    })
  });
  e.target.reset();
  document.getElementById('fecha').value = new Date().toLocaleDateString('en-CA');
  cargarTransacciones();
};

cargarCategorias();
cargarTransacciones();