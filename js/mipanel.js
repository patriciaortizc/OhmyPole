
// Página de mi panel

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyB5eB36TuhUf275ArTsXxJ3XfwQocu-7TU",
    authDomain: "ohmypole-45123.firebaseapp.com",
    projectId: "ohmypole-45123",
    storageBucket: "ohmypole-45123.firebasestorage.app",
    messagingSenderId: "5555383295",
    appId: "1:5555383295:web:e24f20e254feebea2615ca"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Horario completo
const horario = [
    { dia: 'Lunes', hora: '10:00', clase: 'Pole Exotic', sala: 'Sala 1' },
    { dia: 'Lunes', hora: '17:00', clase: 'Pole Dance 1', sala: 'Sala 1' },
    { dia: 'Lunes', hora: '17:00', clase: 'Pole Dance 3', sala: 'Sala 2' },
    { dia: 'Lunes', hora: '17:00', clase: 'Aéreos', sala: 'Sala Aéreos', nota: '18:00' },
    { dia: 'Lunes', hora: '18:30', clase: 'Pole Libre', sala: 'Sala 1' },
    { dia: 'Lunes', hora: '18:30', clase: 'Pole Dance 2', sala: 'Sala 2' },
    { dia: 'Lunes', hora: '20:00', clase: 'Pole Dance 1', sala: 'Sala 1' },
    { dia: 'Martes', hora: '10:00', clase: 'Pole Dance 2', sala: 'Sala 2' },
    { dia: 'Martes', hora: '11:30', clase: 'Pole Dance 1', sala: 'Sala 1' },
    { dia: 'Martes', hora: '11:30', clase: 'Pole Libre', sala: 'Sala 2' },
    { dia: 'Martes', hora: '17:00', clase: 'Pole Dance 2', sala: 'Sala 2' },
    { dia: 'Martes', hora: '18:30', clase: 'Pole Dance 1', sala: 'Sala 1' },
    { dia: 'Martes', hora: '18:30', clase: 'Flexibilidad', sala: 'Sala 2' },
    { dia: 'Martes', hora: '20:00', clase: 'Pole Exotic', sala: 'Sala 1', nota: '20:30' },
    { dia: 'Martes', hora: '20:00', clase: 'Pole Dance 2', sala: 'Sala 2' },
    { dia: 'Miércoles', hora: '10:00', clase: 'Pole Dance 1', sala: 'Sala 1' },
    { dia: 'Miércoles', hora: '11:30', clase: 'Flexibilidad', sala: 'Sala 1' },
    { dia: 'Miércoles', hora: '17:00', clase: 'Pole Dance 1', sala: 'Sala 1' },
    { dia: 'Miércoles', hora: '17:00', clase: 'Pole Dance 2', sala: 'Sala 2' },
    { dia: 'Miércoles', hora: '17:00', clase: 'Telas', sala: 'Sala Aéreos' },
    { dia: 'Miércoles', hora: '18:30', clase: 'Pole Dance 1', sala: 'Sala 1' },
    { dia: 'Miércoles', hora: '18:30', clase: 'Flexibilidad', sala: 'Sala 2' },
    { dia: 'Miércoles', hora: '18:30', clase: 'Aro', sala: 'Sala Aéreos' },
    { dia: 'Miércoles', hora: '20:00', clase: 'Pole Dance 1', sala: 'Sala 1' },
    { dia: 'Miércoles', hora: '20:00', clase: 'Pole Libre', sala: 'Sala 2', nota: '19:30' },
    { dia: 'Jueves', hora: '10:00', clase: 'Pole Dance 2', sala: 'Sala 2' },
    { dia: 'Jueves', hora: '11:30', clase: 'Pole Libre', sala: 'Sala 2' },
    { dia: 'Jueves', hora: '18:30', clase: 'Pole Dance 1', sala: 'Sala 1' },
    { dia: 'Jueves', hora: '18:30', clase: 'Pole Dance 3', sala: 'Sala 2' },
    { dia: 'Jueves', hora: '20:00', clase: 'Pole Exotic', sala: 'Sala 1' },
    { dia: 'Jueves', hora: '20:00', clase: 'Flexibilidad', sala: 'Sala 2' },
    { dia: 'Viernes', hora: '10:00', clase: 'Pole Dance 1', sala: 'Sala 1' },
    { dia: 'Viernes', hora: '11:30', clase: 'Flexibilidad', sala: 'Sala 1' },
    { dia: 'Viernes', hora: '17:00', clase: 'Pole Dance 1', sala: 'Sala 1' },
    { dia: 'Viernes', hora: '17:00', clase: 'Aro', sala: 'Sala Aéreos' },
    { dia: 'Viernes', hora: '18:30', clase: 'Pole Libre', sala: 'Sala 1' },
    { dia: 'Viernes', hora: '18:30', clase: 'Pole Dance 2', sala: 'Sala 2' },
    { dia: 'Viernes', hora: '18:30', clase: 'Telas', sala: 'Sala Aéreos' },
    { dia: 'Viernes', hora: '20:00', clase: 'Verticales', sala: 'Sala 1' },
    { dia: 'Sábado', hora: '10:00', clase: 'Pole Dance 1', sala: 'Sala 1' },
    { dia: 'Sábado', hora: '10:00', clase: 'Pole Libre', sala: 'Sala 2' },
    { dia: 'Sábado', hora: '10:00', clase: 'Aéreos', sala: 'Sala Aéreos' },
    { dia: 'Sábado', hora: '11:30', clase: 'Pole Dance 2', sala: 'Sala 2' },
];

let usuarioActual = null;
let reservasUsuario = [];

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = 'acceder.html';
        return;
    }
    usuarioActual = user;
    document.getElementById('nombre-usuario').textContent = user.displayName || user.email;
    await cargarReservas();
    renderHorario();
});

async function cargarReservas() {
    const q = query(collection(db, 'reservas'), where('uid', '==', usuarioActual.uid));
    const snap = await getDocs(q);
    reservasUsuario = [];
    snap.forEach(d => reservasUsuario.push({ id: d.id, ...d.data() }));
    renderReservas();
}

function renderReservas() {
    const lista = document.getElementById('lista-reservas');
    if (reservasUsuario.length === 0) {
        lista.innerHTML = '<p class="sin-reservas">No tienes clases reservadas aún.</p>';
        return;
    }
    lista.innerHTML = reservasUsuario.map(r => `
                <div class="reserva-card">
                    <div class="reserva-info">
                        <div class="clase-nombre">${r.clase}</div>
                        <div class="clase-detalle">${r.dia} · ${r.hora} · ${r.sala}</div>
                    </div>
                    <button class="btn-cancelar" onclick="cancelarReserva('${r.id}')">Cancelar</button>
                </div>
            `).join('');
}

function renderHorario() {
    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const grid = document.getElementById('dias-grid');
    grid.innerHTML = dias.map(dia => {
        const clasesDelDia = horario.filter(c => c.dia === dia);
        return `
                    <div class="dia-bloque">
                        <div class="dia-titulo">${dia}</div>
                        <div class="clases-lista">
                            ${clasesDelDia.map(c => {
            const clave = `${c.dia}-${c.hora}-${c.clase}-${c.sala}`;
            const yaReservada = reservasUsuario.some(r => r.clave === clave);
            return `
                                    <div class="clase-item ${yaReservada ? 'reservada' : ''}"
                                         onclick="reservar('${c.dia}','${c.hora}','${c.clase}','${c.sala}')">
                                        <div class="clase-nombre-item">${c.clase}${c.nota ? ` (${c.nota})` : ''}</div>
                                        <div class="clase-hora">${c.hora}</div>
                                        <div class="clase-sala">${c.sala}</div>
                                    </div>
                                `;
        }).join('')}
                        </div>
                    </div>
                `;
    }).join('');
}

window.reservar = async (dia, hora, clase, sala) => {
    const clave = `${dia}-${hora}-${clase}-${sala}`;
    if (reservasUsuario.some(r => r.clave === clave)) {
        mostrarToast('Ya tienes esta clase reservada');
        return;
    }
    await addDoc(collection(db, 'reservas'), {
        uid: usuarioActual.uid,
        email: usuarioActual.email,
        nombre: usuarioActual.displayName,
        dia, hora, clase, sala, clave,
        fechaReserva: new Date().toISOString()
    });
    mostrarToast(`✓ Clase reservada: ${clase} · ${dia} ${hora}`);
    await cargarReservas();
    renderHorario();
};

window.cancelarReserva = async (id) => {
    await deleteDoc(doc(db, 'reservas', id));
    mostrarToast('Reserva cancelada');
    await cargarReservas();
    renderHorario();
};

window.cerrarSesion = async () => {
    await signOut(auth);
    window.location.href = 'acceder.html';
};

function mostrarToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.style.display = 'block';
    setTimeout(() => t.style.display = 'none', 3000);
}