const AVATARES = {
  gato:    { feliz: '😻', neutral: '😺', preocupado: '😿', alarmado: '🙀' },
  mono:    { feliz: '🐵', neutral: '🙉', preocupado: '🙈', alarmado: '🙊' },
  persona: { feliz: '😄', neutral: '🙂', preocupado: '😟', alarmado: '😱' }
};

const CONSEJOS = [
  '💡 Anota tus gastos apenas los hagas, así no se te olvidan.',
  '💡 Los gastos pequeños de cada día suman mucho a fin de mes.',
  '💡 Intenta ahorrar al menos el 10% de tus ingresos.',
  '💡 Antes de comprar algo que no necesitas, espera un día y mira si aún lo quieres.'
];

let avatarElegido = localStorage.getItem('avatar') || 'gato';
let ultimaInfo = null;

const elAvatar = document.getElementById('avatar');
const elSelector = document.getElementById('selectorAvatar');
const elTexto = document.getElementById('globoTexto');
const elBotones = document.getElementById('globoBotones');
const elProgreso = document.getElementById('progreso');
const elProgresoTexto = document.getElementById('progresoTexto');
const elPresupuesto = document.getElementById('presupuestoInput');

elSelector.value = avatarElegido;

function fmt(numero) {
  return '$' + Number(numero).toLocaleString('es-CO');
}

function irALista() {
  document.getElementById('lista').scrollIntoView({ behavior: 'smooth' });
}

function enfocarPresupuesto() {
  elPresupuesto.scrollIntoView({ behavior: 'smooth', block: 'center' });
  elPresupuesto.focus();
}

function decirAlgo(texto) {
  elTexto.textContent = texto;
  elBotones.innerHTML = '';
}

function decidirMensaje(gastado, presupuesto) {
  if (presupuesto <= 0) {
    return {
      estado: 'neutral', porcentaje: 0, gastado, presupuesto,
      texto: '¡Hola! Define tu presupuesto mensual y te ayudo a cuidarlo. 💪',
      botones: [{ texto: 'Definir presupuesto', accion: enfocarPresupuesto }]
    };
  }

  const porcentaje = Math.round((gastado / presupuesto) * 100);
  const base = { porcentaje, gastado, presupuesto };

  if (porcentaje >= 100) {
    return { ...base, estado: 'alarmado',
      texto: '¡Superaste tu presupuesto del mes! Llevas ' + fmt(gastado) + ' de ' + fmt(presupuesto) + '. Respira, revisemos en qué se fue.',
      botones: [
        { texto: 'Ver mis gastos', accion: irALista },
        { texto: 'Ajustar presupuesto', accion: enfocarPresupuesto }
      ] };
  }
  if (porcentaje >= 80) {
    return { ...base, estado: 'preocupado',
      texto: '¡Cuidado! Ya usaste el ' + porcentaje + '% de tu presupuesto. Te quedan ' + fmt(presupuesto - gastado) + '.',
      botones: [
        { texto: 'Ver mis gastos', accion: irALista },
        { texto: 'Entendido', accion: () => decirAlgo('¡Perfecto! Aquí estaré para avisarte. 😊') }
      ] };
  }
  if (porcentaje >= 50) {
    return { ...base, estado: 'neutral',
      texto: 'Vas por el ' + porcentaje + '% de tu presupuesto. Todo bajo control, pero ojo con los gastos pequeños. 👀',
      botones: [] };
  }
  return { ...base, estado: 'feliz',
    texto: '¡Vas excelente! Solo has usado el ' + porcentaje + '% de tu presupuesto. ¡Sigue así! 🎉',
    botones: [] };
}

function mostrarAvatar(info) {
  ultimaInfo = info;

  elAvatar.textContent = AVATARES[avatarElegido][info.estado];
  elAvatar.className = 'avatar';
  void elAvatar.offsetWidth; // reinicia la animación
  elAvatar.classList.add('av-' + info.estado);

  elTexto.textContent = info.texto;
  elBotones.innerHTML = '';
  info.botones.forEach(b => {
    const boton = document.createElement('button');
    boton.textContent = b.texto;
    boton.onclick = b.accion;
    elBotones.appendChild(boton);
  });

  elProgreso.style.width = Math.min(info.porcentaje, 100) + '%';
  elProgreso.className = 'nivel-' + info.estado;
  elProgresoTexto.textContent = info.presupuesto > 0
    ? 'Gastado este mes: ' + fmt(info.gastado) + ' de ' + fmt(info.presupuesto) + ' (' + info.porcentaje + '%)'
    : 'Aún no has definido un presupuesto.';
}

async function refrescarAvatar() {
  const cabeceras = { 'Authorization': 'Bearer ' + localStorage.getItem('token') };
  const [resTrans, resPres] = await Promise.all([
    fetch('http://localhost:3000/api/transacciones', { headers: cabeceras }),
    fetch('http://localhost:3000/api/presupuesto', { headers: cabeceras })
  ]);
  if (!resTrans.ok || !resPres.ok) return;

  const transacciones = await resTrans.json();
  const datos = await resPres.json();

  const mes = new Date().toLocaleDateString('en-CA').slice(0, 7);
  let gastado = 0;
  transacciones.forEach(t => {
    if (t.tipo === 'gasto' && t.fecha.startsWith(mes)) gastado += Number(t.monto);
  });

  if (document.activeElement !== elPresupuesto) {
    elPresupuesto.value = datos.presupuesto > 0 ? datos.presupuesto : '';
  }
  mostrarAvatar(decidirMensaje(gastado, datos.presupuesto));
}

document.getElementById('formPresupuesto').onsubmit = async (e) => {
  e.preventDefault();
  await fetch('http://localhost:3000/api/presupuesto', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    },
    body: JSON.stringify({ presupuesto: elPresupuesto.value })
  });
  refrescarAvatar();
};

elSelector.onchange = () => {
  avatarElegido = elSelector.value;
  localStorage.setItem('avatar', avatarElegido);
  if (ultimaInfo) mostrarAvatar(ultimaInfo);
};

elAvatar.onclick = () => {
  decirAlgo(CONSEJOS[Math.floor(Math.random() * CONSEJOS.length)]);
};