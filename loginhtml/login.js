
// Cargar usuarios desde localStorage, con usuario por defecto si no existe
let usersDB = JSON.parse(localStorage.getItem('usersDB')) || [
    { name: 'Ana García', email: 'ana@correo.com', user: 'ana_garcia', password: 'Password123' }
];

// Función para guardar usersDB en localStorage
function saveUsersDB() {
    localStorage.setItem('usersDB', JSON.stringify(usersDB));
}

// ==========================================
// NAVEGACIÓN Y UI
// ==========================================
function navTo(targetId) {
    // Ocultar todas las pantallas
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
        screen.classList.add('fade-out');
    });

    // Mostrar target con un pequeño delay para la animación
    setTimeout(() => {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('fade-out'));
        document.getElementById(targetId).classList.add('active');
    }, 50);
}

function togglePassword(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);

    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Selección de Chips (Onboarding)
function toggleChip(element, isRadioMode = false) {
    if (isRadioMode) {
        // Si es radio mode (Condición), deselecciona los demás
        element.parentElement.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        element.classList.add('active');
    } else {
        // Multiselección (Objetivos)
        element.classList.toggle('active');
    }
}

// ==========================================
// VALIDACIONES Y LÓGICA DE REGISTRO
// ==========================================

let currentRegistrationData = {};

function validateEmailUnique() {
    const email = document.getElementById('reg-email').value;
    const errorMsg = document.getElementById('error-email');
    const exists = usersDB.some(u => u.email === email);
    errorMsg.style.display = exists ? 'block' : 'none';
    checkFormValidity();
}

function validateUserUnique() {
    const user = document.getElementById('reg-user').value.replace('@', '');
    const errorMsg = document.getElementById('error-user');
    const exists = usersDB.some(u => u.user === user);
    errorMsg.style.display = exists ? 'block' : 'none';
    checkFormValidity();
}

function checkPasswordStrength() {
    const pass = document.getElementById('reg-password').value;
    const s1 = document.getElementById('str-1');
    const s2 = document.getElementById('str-2');
    const s3 = document.getElementById('str-3');
    const s4 = document.getElementById('str-4');

    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass)) strength++;

    // Reseteo
    s1.style.backgroundColor = '#e2e8f0';
    s2.style.backgroundColor = '#e2e8f0';
    s3.style.backgroundColor = '#e2e8f0';
    s4.style.backgroundColor = '#e2e8f0';

    if (strength >= 1) s1.style.backgroundColor = '#ef4444'; // Rojo (débil)
    if (strength >= 2) s2.style.backgroundColor = '#ef4444';
    if (strength >= 3) {
        s1.style.backgroundColor = '#eab308'; // Amarillo (medio)
        s2.style.backgroundColor = '#eab308';
        s3.style.backgroundColor = '#eab308';
    }
    if (strength === 4) {
        s1.style.backgroundColor = '#4ade80'; // Verde (fuerte)
        s2.style.backgroundColor = '#4ade80';
        s3.style.backgroundColor = '#4ade80';
        s4.style.backgroundColor = '#4ade80';
    }

    checkPasswordMatch();
    checkFormValidity();
    return strength === 4;
}

function checkPasswordMatch() {
    const p1 = document.getElementById('reg-password').value;
    const p2 = document.getElementById('reg-password-confirm').value;
    const errorMsg = document.getElementById('error-password-match');

    if (p2.length > 0 && p1 !== p2) {
        errorMsg.style.display = 'block';
    } else {
        errorMsg.style.display = 'none';
    }
    checkFormValidity();
}

function checkFormValidity() {
    const emailError = document.getElementById('error-email').style.display === 'block';
    const userError = document.getElementById('error-user').style.display === 'block';
    const matchError = document.getElementById('error-password-match').style.display === 'block';
    const p1 = document.getElementById('reg-password').value;
    const btn = document.getElementById('btn-next-1');

    // Habilitar o deshabilitar el botón de continuar
    if (!emailError && !userError && !matchError && p1.length >= 8) {
        btn.disabled = false;
    } else {
        btn.disabled = true;
    }
}

function handleRegisterStep1(e) {
    e.preventDefault();
    if (!checkPasswordStrength()) {
        alert("La contraseña debe tener mínimo 8 caracteres, 1 mayúscula y 1 número.");
        return;
    }

    const p1 = document.getElementById('reg-password').value;
    const p2 = document.getElementById('reg-password-confirm').value;
    if (p1 !== p2) return;

    // Guardar datos temporales
    currentRegistrationData = {
        name: document.getElementById('reg-name').value,
        email: document.getElementById('reg-email').value,
        user: document.getElementById('reg-user').value.replace('@', ''),
        password: p1
    };

    // Avanzar al paso 2
    navTo('screen-onboarding');
}

// ==========================================
// LÓGICA DE SALUD (Onboarding 2)
// ==========================================
function calculateIMC() {
    const weight = parseFloat(document.getElementById('ob-weight').value);
    const height = parseFloat(document.getElementById('ob-height').value);
    const imcDisplay = document.getElementById('imc-value');

    if (weight > 0 && height > 0) {
        const imc = weight / (height * height);
        imcDisplay.innerText = imc.toFixed(1);
    } else {
        imcDisplay.innerText = '--';
    }
}

function handleRegisterComplete(e) {
    e.preventDefault();

    // Recopilar selección de chips
    const condition = document.querySelector('#chips-condition .active')?.innerText;
    const goals = Array.from(document.querySelectorAll('#chips-goals .active')).map(c => c.innerText);

    const finalUserData = {
        ...currentRegistrationData,
        birthDate: document.getElementById('ob-date').value,
        gender: document.getElementById('ob-gender').value,
        weight: document.getElementById('ob-weight').value,
        height: document.getElementById('ob-height').value,
        condition: condition,
        goals: goals
    };

    // Guardar en "DB"
    usersDB.push(finalUserData);
    saveUsersDB();
    console.log("Usuario registrado:", finalUserData);

    // Loguear automáticamente e ir a home
    loadUserData(finalUserData);
    navTo('screen-home');
}

// ==========================================
// LÓGICA DE LOGIN
// ==========================================
function handleLogin(e) {
    e.preventDefault();
    const emailInput = document.getElementById('login-email').value.trim();
    const passInput = document.getElementById('login-password').value;
    const errorMsg = document.getElementById('login-error');

    // Verificar campos vacíos
    if (!emailInput || !passInput) {
        errorMsg.innerText = 'Por favor, completa todos los campos.';
        errorMsg.style.display = 'block';
        return;
    }

    // Buscar usuario por email o usuario (sin verificar contraseña)
    const userExists = usersDB.find(u => u.email === emailInput || u.user === emailInput);

    if (!userExists) {
        errorMsg.innerText = 'Usuario no registrado.';
        errorMsg.style.display = 'block';
        return;
    }

    // Verificar contraseña
    if (userExists.password !== passInput) {
        errorMsg.innerText = 'Contraseña incorrecta.';
        errorMsg.style.display = 'block';
        return;
    }

    // Login exitoso
    errorMsg.style.display = 'none';
    loadUserData(userExists);
    navTo('screen-home');
}

function loadUserData(user) {
    document.getElementById('home-username').innerText = user.name.split(' ')[0] + ' ' + (user.name.split(' ')[1] || '');
    // Generar avatar dinámico con iniciales
    const nameParam = encodeURIComponent(user.name);
    document.getElementById('home-avatar').src = `https://ui-avatars.com/api/?name=${nameParam}&background=bae6fd&color=1e293b`;

    // Limpiar formularios
    document.getElementById('login-form').reset();
    document.getElementById('register-form').reset();
    document.getElementById('onboarding-form').reset();
    document.getElementById('imc-value').innerText = '--';
    document.getElementById('str-1').style.backgroundColor = '#e2e8f0';
    document.getElementById('str-2').style.backgroundColor = '#e2e8f0';
    document.getElementById('str-3').style.backgroundColor = '#e2e8f0';
    document.getElementById('str-4').style.backgroundColor = '#e2e8f0';
}

function logout() {
    if (confirm('¿Deseas cerrar sesión?')) {
        navTo('screen-login');
    }
}

