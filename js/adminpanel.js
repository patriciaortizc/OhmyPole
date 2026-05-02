import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

const ADMIN_EMAIL = 'patricia71195@hotmail.com';

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

onAuthStateChanged(auth, user => {
    if (!user) {
        window.location.href = 'acceder.html';
        return;
    }
    if (user.email !== ADMIN_EMAIL) {
        window.location.href = 'mipanel.html';
        return;
    }
    mostrarAvisoDia6();
    cargarAlumnas();
});

function mostrarAvisoDia6() {
    const dia = new Date().getDate();
    if (dia >= 1 && dia <= 6) {
        document.getElementById('aviso-container').innerHTML = `
            <div class="aviso-mes">
                <strong>⚠️ Período de pago activo</strong> — Las alumnas tienen hasta el día 6 para pagar.
                Hoy es día ${dia}. Marca como pagadas a las que hayan abonado su cuota.
            </div>`;
    }
}

async function cargarAlumnas() {
    const lista = document.getElementById('alumnas-lista');
    try {
        const snapshot = await getDocs(collection(db, 'usuarios'));
        const alumnas = [];
        snapshot.forEach(d => alumnas.push({ id: d.id, ...d.data() }));

        const alumnasFiltradas = alumnas.filter(a => a.email !== ADMIN_EMAIL);

        const pagadas = alumnasFiltradas.filter(a => estaAlDia(a)).length;
        document.getElementById('stat-total').textContent = alumnasFiltradas.length;
        document.getElementById('stat-pagadas').textContent = pagadas;
        document.getElementById('stat-pendientes').textContent = alumnasFiltradas.length - pagadas;

        if (alumnasFiltradas.length === 0) {
            lista.innerHTML = '<div class="loading-msg">No hay alumnas registradas todavía.</div>';
            return;
        }

        alumnasFiltradas.sort((a, b) => {
            if (estaAlDia(a) === estaAlDia(b)) return 0;
            return estaAlDia(a) ? 1 : -1;
        });

        lista.innerHTML = alumnasFiltradas.map(a => renderAlumna(a)).join('');

        lista.querySelectorAll('.select-plan').forEach(sel => {
            sel.addEventListener('change', () => cambiarPlan(sel.dataset.uid, sel.value));
        });
        lista.querySelectorAll('.btn-pagado').forEach(btn => {
            btn.addEventListener('click', () => togglePago(btn.dataset.uid, btn.dataset.pagado === 'true'));
        });
        lista.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', () => eliminarAlumna(btn.dataset.uid, btn.dataset.nombre));
        });

    } catch (e) {
        lista.innerHTML = '<div class="loading-msg">Error al cargar alumnas.</div>';
        console.error(e);
    }
}

function estaAlDia(alumna) {
    if (!alumna.pagado || !alumna.fechaPago) return false;
    const hoy = new Date();
    const fechaPago = new Date(alumna.fechaPago);
    return fechaPago.getMonth() === hoy.getMonth() && fechaPago.getFullYear() === hoy.getFullYear();
}

function renderAlumna(a) {
    const alDia = estaAlDia(a);
    const tienePlan = a.plan === '50' || a.plan === '80';
    const cardClass = alDia ? 'pagada' : (tienePlan ? 'sin-pagar' : 'sin-plan');

    let badgeClass, badgeTexto;
    if (!tienePlan)      { badgeClass = 'sin-plan';  badgeTexto = 'Sin plan'; }
    else if (alDia)      { badgeClass = 'al-dia';    badgeTexto = '✓ Al día'; }
    else                 { badgeClass = 'pendiente'; badgeTexto = '⚠ Pago pendiente'; }

    const fechaRegistro  = a.fechaRegistro ? new Date(a.fechaRegistro).toLocaleDateString('es-ES') : '–';
    const fechaPagoTexto = a.fechaPago && alDia ? `Pagó el ${new Date(a.fechaPago).toLocaleDateString('es-ES')}` : '';

    return `
    <div class="alumna-card ${cardClass}">
        <div class="alumna-info">
            <div class="alumna-nombre">${a.nombre || 'Sin nombre'}</div>
            <div class="alumna-email">${a.email || ''}</div>
            <div class="alumna-fecha">Registrada: ${fechaRegistro}</div>
            ${fechaPagoTexto ? `<div class="alumna-fecha">${fechaPagoTexto}</div>` : ''}
            <span class="badge-pago ${badgeClass}">${badgeTexto}</span>
        </div>
        <div class="alumna-controles">
            <select class="select-plan" data-uid="${a.uid || a.id}">
                <option value=""   ${!tienePlan       ? 'selected' : ''}>Sin plan</option>
                <option value="50" ${a.plan === '50'  ? 'selected' : ''}>50€/mes – 1 clase/semana</option>
                <option value="80" ${a.plan === '80'  ? 'selected' : ''}>80€/mes – 2 clases/semana</option>
            </select>
            <button class="btn-pagado ${alDia ? 'activo' : ''}"
                    data-uid="${a.uid || a.id}"
                    data-pagado="${alDia}">
                ${alDia ? '✓ Pagado' : 'Marcar pagado'}
            </button>
            <button class="btn-eliminar" data-uid="${a.uid || a.id}" data-nombre="${a.nombre || 'esta alumna'}">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    </div>`;
}

async function cambiarPlan(uid, plan) {
    try {
        await updateDoc(doc(db, 'usuarios', uid), { plan: plan || null });
        mostrarToast('Plan actualizado ✓');
        setTimeout(cargarAlumnas, 500);
    } catch (e) {
        mostrarToast('Error al actualizar el plan');
    }
}

async function togglePago(uid, estabaPagado) {
    try {
        if (estabaPagado) {
            await updateDoc(doc(db, 'usuarios', uid), { pagado: false, fechaPago: null });
            mostrarToast('Pago desmarcado');
        } else {
            await updateDoc(doc(db, 'usuarios', uid), { pagado: true, fechaPago: new Date().toISOString() });
            mostrarToast('¡Pago registrado ✓');
        }
        setTimeout(cargarAlumnas, 500);
    } catch (e) {
        mostrarToast('Error al actualizar el pago');
    }
}

async function eliminarAlumna(uid, nombre) {
    if (!confirm(`¿Seguro que quieres eliminar a ${nombre}? Se borrarán sus datos.`)) return;
    try {
        await deleteDoc(doc(db, 'usuarios', uid));
        mostrarToast('Alumna eliminada');
        setTimeout(cargarAlumnas, 500);
    } catch (e) {
        mostrarToast('Error al eliminar');
    }
}

window.cerrarSesion = async () => {
    await signOut(auth);
    window.location.href = 'acceder.html';
};

function mostrarToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.style.display = 'block';
    setTimeout(() => t.style.display = 'none', 2500);
}