const API = 'http://localhost:3000/api/auth';

const formLogin = document.getElementById('formLogin');
const formRegistro = document.getElementById('formRegistro');
const btnLogin = document.getElementById('btnLogin');
const btnRegistro = document.getElementById('btnRegistro');
const mensaje = document.getElementById('mensaje');

function mostrar(cual) {
  const esLogin = cual === 'login';
  formLogin.classList.toggle('oculto', !esLogin);
  formRegistro.classList.toggle('oculto', esLogin);
  btnLogin.classList.toggle('activa', esLogin);
  btnRegistro.classList.toggle('activa', !esLogin);
  mensaje.textContent = '';
}

btnLogin.onclick = () => mostrar('login');
btnRegistro.onclick = () => mostrar('registro');

formRegistro.onsubmit = async (e) => {
  e.preventDefault();
  const respuesta = await fetch(API + '/registro', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombre: document.getElementById('regNombre').value,
      correo: document.getElementById('regCorreo').value,
      contrasena: document.getElementById('regContrasena').value
    })
  });
  const datos = await respuesta.json();
  mensaje.textContent = datos.mensaje;
  if (respuesta.ok) mostrar('login');
};

formLogin.onsubmit = async (e) => {
  e.preventDefault();
  const respuesta = await fetch(API + '/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      correo: document.getElementById('loginCorreo').value,
      contrasena: document.getElementById('loginContrasena').value
    })
  });
  const datos = await respuesta.json();
  if (respuesta.ok) {
    localStorage.setItem('token', datos.token);
    localStorage.setItem('usuario', JSON.stringify(datos.usuario));
    window.location.href = 'dashboard.html';
  } else {
    mensaje.textContent = datos.mensaje;
  }
};