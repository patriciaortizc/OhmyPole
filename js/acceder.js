import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

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

window.mostrarLogin = () => {
    document.getElementById('form-login').style.display = 'block';
    document.getElementById('form-registro').style.display = 'none';
    document.getElementById('tab-login').classList.add('active');
    document.getElementById('tab-registro').classList.remove('active');
};

window.mostrarRegistro = () => {
    document.getElementById('form-login').style.display = 'none';
    document.getElementById('form-registro').style.display = 'block';
    document.getElementById('tab-login').classList.remove('active');
    document.getElementById('tab-registro').classList.add('active');
};

window.login = async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');
    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = user.email === 'patricia71195@hotmail.com' ? 'adminpanel.html' : 'mipanel.html';
    } catch (err) {
        errorEl.style.display = 'block';
        errorEl.textContent = traducirError(err.code);
    }
};

window.registro = async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('reg-nombre').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const errorEl = document.getElementById('reg-error');
    const successEl = document.getElementById('reg-success');
    try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: nombre });
        await setDoc(doc(db, 'usuarios', cred.user.uid), {
            uid: cred.user.uid,
            nombre: nombre,
            email: email,
            plan: null,
            pagado: false,
            fechaPago: null,
            matricula: true,
            fechaRegistro: new Date().toISOString()
        });
        successEl.style.display = 'block';
        successEl.textContent = '¡Cuenta creada! Redirigiendo...';
        setTimeout(() => window.location.href = cred.user.email === 'patricia71195@hotmail.com' ? 'adminpanel.html' : 'mipanel.html', 1500);
    } catch (err) {
        errorEl.style.display = 'block';
        errorEl.textContent = traducirError(err.code);
    }
};

function traducirError(code) {
    const errores = {
        'auth/invalid-email': 'El email no es válido.',
        'auth/user-not-found': 'No existe una cuenta con ese email.',
        'auth/wrong-password': 'Contraseña incorrecta.',
        'auth/email-already-in-use': 'Ya existe una cuenta con ese email.',
        'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
        'auth/invalid-credential': 'Email o contraseña incorrectos.'
    };
    return errores[code] || 'Ha ocurrido un error. Inténtalo de nuevo.';
}