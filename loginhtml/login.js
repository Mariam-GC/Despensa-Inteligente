
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

    // Validación de fecha de nacimiento
const birthDateVal = document.getElementById('ob-date').value;
if (!birthDateVal) {
    alert('Por favor ingresa tu fecha de nacimiento.');
    return;
}

const birthDate = new Date(birthDateVal);
const today     = new Date();

// Calcular edad exacta en años
let age = today.getFullYear() - birthDate.getFullYear();
const monthDiff = today.getMonth() - birthDate.getMonth();
if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
}

if (age < 12) {
    alert('La fecha de nacimiento no es válida. La edad mínima es 12 años.');
    document.getElementById('ob-date').focus();
    return;
}

if (age > 99) {
    alert('La fecha de nacimiento no es válida. La edad máxima es 99 años.');
    document.getElementById('ob-date').focus();
    return;
}

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

// ==========================================
// POST-INGESTA LOGIC
// ==========================================

let currentPostIntakeFood = null;

// Llama esta función desde el botón de cada alimento en home
// Ejemplo: onclick="openPostIntake({ name:'Brócoli al vapor', emoji:'🥦', kcal:34, protein:2.8, carbs:6.6, fiber:2.6, grams:150 })"
function openPostIntake(foodData) {
    currentPostIntakeFood = foodData;

    // Rellenar header con datos del alimento
    document.getElementById('pi-emoji').textContent       = foodData.emoji  || '🍽️';
    document.getElementById('pi-food-name').textContent   = foodData.name   || 'Alimento';

    // Macros pills
    const macrosEl = document.getElementById('pi-macros');
    macrosEl.innerHTML = '';
    if (foodData.kcal)    macrosEl.innerHTML += `<span class="pi-macro-pill">${foodData.kcal} kcal</span>`;
    if (foodData.protein) macrosEl.innerHTML += `<span class="pi-macro-pill">${foodData.protein}g proteína</span>`;
    if (foodData.carbs)   macrosEl.innerHTML += `<span class="pi-macro-pill">${foodData.carbs}g carbs</span>`;
    if (foodData.fiber)   macrosEl.innerHTML += `<span class="pi-macro-pill">${foodData.fiber}g fibra</span>`;

    // Hora y cantidad
    const now = new Date();
    const timeStr = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('pi-time-label').textContent =
        `Hoy, ${timeStr} · ${foodData.grams || 100}g`;

    // Limpiar estado anterior del formulario
    resetPostIntakeForm();

    // Navegar a la pantalla
    navTo('screen-post-intake');
}

function togglePiChip(el, colorClass) {
    const activeClass = 'active-' + colorClass;
    el.classList.toggle(activeClass);
}

function selectTiming(el, val) {
    document.querySelectorAll('#timing-btns .pi-timing-btn')
        .forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    el.dataset.val = val;
}

function updateCharCount() {
    const val = document.getElementById('pi-notes').value.length;
    document.getElementById('pi-char-count').textContent = `${val} / 300`;
}

function submitPostIntake() {
    // Recopilar chips seleccionados por sección
    const getSelected = (groupId) =>
        [...document.querySelectorAll(`#${groupId} .pi-chip[class*="active-"]`)]
            .map(c => c.dataset.val);

    const timingEl = document.querySelector('#timing-btns .pi-timing-btn.active');

    const postIntakeData = {
        food:             currentPostIntakeFood,
        physical_states:  getSelected('chips-fisico'),
        emotional_states: getSelected('chips-emocional'),
        digestive_states: getSelected('chips-digestivo'),
        skin_symptoms:    getSelected('chips-piel'),
        symptom_timing:   timingEl ? timingEl.textContent.trim() : 'Inmediatamente',
        notes:            document.getElementById('pi-notes').value.trim(),
        recorded_at:      new Date().toISOString()
    };

    console.log('Post-ingesta guardada:', postIntakeData);
    // TODO: reemplazar console.log por fetch('/api/diary/{id}/post-intake', { method:'POST', body: JSON.stringify(postIntakeData) })

    // Mostrar pantalla de éxito
    const allSelected = [
        ...postIntakeData.physical_states,
        ...postIntakeData.emotional_states,
        ...postIntakeData.digestive_states,
        ...postIntakeData.skin_symptoms
    ];

    const msg = allSelected.length > 0
        ? `Registramos: ${allSelected.join(', ')}. Esto nos ayuda a personalizar tus recomendaciones.`
        : 'Tu reacción ha sido registrada. Esto nos ayuda a personalizar tus recomendaciones.';

    document.getElementById('pi-success-msg').textContent = msg;
    document.getElementById('pi-success').classList.remove('hidden');
    document.getElementById('pi-success').classList.add('flex');
}

function resetPostIntakeForm() {
    // Limpiar todos los chips activos
    document.querySelectorAll('.pi-chip[class*="active-"]').forEach(c => {
        c.className = 'pi-chip';
        c.setAttribute('onclick', c.getAttribute('onclick'));
    });

    // Reset timing al primero
    document.querySelectorAll('#timing-btns .pi-timing-btn').forEach((b, i) => {
        b.classList.toggle('active', i === 0);
    });

    // Limpiar notas
    document.getElementById('pi-notes').value = '';
    document.getElementById('pi-char-count').textContent = '0 / 300';

    // Ocultar pantalla de éxito
    const success = document.getElementById('pi-success');
    success.classList.add('hidden');
    success.classList.remove('flex');
}
// ==========================================
// BUSCADOR Y DIARIO DE CONSUMO DIARIO
// ==========================================
let pendingFood = null; // almacena el alimento seleccionado antes de confirmar cantidad
const FOOD_DB = [
  { id:1,  name:'Manzana',            emoji:'🍎', group:'Frutas',      kcal:52,  protein:0.3,  carbs:13.8, fiber:2.4, fat:0.2  },
  { id:2,  name:'Plátano',            emoji:'🍌', group:'Frutas',      kcal:89,  protein:1.1,  carbs:22.8, fiber:2.6, fat:0.3  },
  { id:3,  name:'Aguacate',           emoji:'🥑', group:'Frutas',      kcal:160, protein:2.0,  carbs:8.5,  fiber:6.7, fat:14.7 },
  { id:4,  name:'Arándano',           emoji:'🫐', group:'Frutas',      kcal:57,  protein:0.7,  carbs:14.5, fiber:2.4, fat:0.3  },
  { id:5,  name:'Fresa',              emoji:'🍓', group:'Frutas',      kcal:32,  protein:0.7,  carbs:7.7,  fiber:2.0, fat:0.3  },
  { id:6,  name:'Brócoli',            emoji:'🥦', group:'Verduras',    kcal:34,  protein:2.8,  carbs:6.6,  fiber:2.6, fat:0.4  },
  { id:7,  name:'Espinaca',           emoji:'🍃', group:'Verduras',    kcal:23,  protein:2.9,  carbs:3.6,  fiber:2.2, fat:0.4  },
  { id:8,  name:'Zanahoria',          emoji:'🥕', group:'Verduras',    kcal:41,  protein:0.9,  carbs:9.6,  fiber:2.8, fat:0.2  },
  { id:9,  name:'Jitomate',           emoji:'🍅', group:'Verduras',    kcal:18,  protein:0.9,  carbs:3.9,  fiber:1.2, fat:0.2  },
  { id:10, name:'Nopal',              emoji:'🌵', group:'Verduras',    kcal:16,  protein:1.3,  carbs:3.3,  fiber:2.2, fat:0.1  },
  { id:11, name:'Avena',              emoji:'🌾', group:'Cereales',    kcal:379, protein:13.2, carbs:67.7, fiber:10.1,fat:6.5  },
  { id:12, name:'Tortilla de maíz',   emoji:'🫓', group:'Cereales',    kcal:218, protein:5.7,  carbs:45.9, fiber:6.5, fat:2.9  },
  { id:13, name:'Arroz blanco',       emoji:'🍚', group:'Cereales',    kcal:130, protein:2.7,  carbs:28.2, fiber:0.4, fat:0.3  },
  { id:14, name:'Frijoles negros',    emoji:'🫘', group:'Leguminosas', kcal:132, protein:8.9,  carbs:23.7, fiber:8.7, fat:0.5  },
  { id:15, name:'Lentejas',           emoji:'🫘', group:'Leguminosas', kcal:116, protein:9.0,  carbs:20.1, fiber:7.9, fat:0.4  },
  { id:16, name:'Pechuga de pollo',   emoji:'🍗', group:'Carnes',      kcal:165, protein:31.0, carbs:0.0,  fiber:0.0, fat:3.6  },
  { id:17, name:'Huevo entero',       emoji:'🥚', group:'Carnes',      kcal:155, protein:12.6, carbs:1.1,  fiber:0.0, fat:10.6 },
  { id:18, name:'Salmón cocido',      emoji:'🐟', group:'Pescados',    kcal:206, protein:30.5, carbs:0.0,  fiber:0.0, fat:9.0  },
  { id:19, name:'Almendras',          emoji:'🥜', group:'Nueces',      kcal:579, protein:21.2, carbs:21.6, fiber:12.5,fat:49.9 },
  { id:20, name:'Semilla de chía',    emoji:'🌱', group:'Semillas',    kcal:486, protein:16.5, carbs:42.1, fiber:34.4,fat:30.7 },
];

const MEAL_ICONS_FA = {
    Desayuno: 'fa-sun',
    Almuerzo: 'fa-cloud-sun',
    Cena:     'fa-moon',
    Snack:    'fa-apple-whole'
};

let foodDiary    = {};   // key: "Desayuno_1" → { food, meal, qty }
let activeMealTab = 'Desayuno';

// ── Buscador ──────────────────────────────────
function selectMealTab(el, meal) {
    activeMealTab = meal;
    document.querySelectorAll('.meal-tab-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    filterFoods();
}

function filterFoods() {
    const q = (document.getElementById('search-input').value || '').toLowerCase().trim();
    const filtered = q
        ? FOOD_DB.filter(f => f.name.toLowerCase().includes(q) || f.group.toLowerCase().includes(q))
        : FOOD_DB;
    renderSearchResults(filtered);
}

function renderSearchResults(foods) {
    const container = document.getElementById('search-results');
    if (!foods.length) {
        container.innerHTML = `
            <div class="flex flex-col items-center py-16 text-gray-400">
                <i class="fa-solid fa-magnifying-glass text-3xl mb-3"></i>
                <p class="text-sm">Sin resultados para tu búsqueda</p>
            </div>`;
        return;
    }

    // Agrupar por categoría
    const groups = {};
    foods.forEach(f => {
        if (!groups[f.group]) groups[f.group] = [];
        groups[f.group].push(f);
    });

    container.innerHTML = Object.entries(groups).map(([grp, items]) => `
        <p class="search-group-label">${grp}</p>
        ${items.map(f => {
            const key   = activeMealTab + '_' + f.id;
            const added = !!foodDiary[key];
            return `
            <div class="food-search-card">
                <div class="fs-emoji">${f.emoji}</div>
                <div class="flex-1 min-w-0">
                    <p class="font-semibold text-brand-dark text-sm">${f.name}</p>
                    <p class="text-[11px] text-gray-400 mt-0.5">${f.group} · por 100g</p>
                    <p class="text-[12px] text-brand-greenDark font-medium mt-0.5">
                        ${f.kcal} kcal · ${f.protein}g prot · ${f.carbs}g carbs
                    </p>
                </div>
                <button class="fs-add-btn ${added ? 'added' : ''}"
                        onclick="addToDiary(${f.id})"
                        aria-label="Agregar ${f.name}">
                    <i class="fa-solid ${added ? 'fa-check' : 'fa-plus'}"></i>
                </button>
            </div>`;
        }).join('')}
    `).join('');
}

function addToDiary(foodId) {
    pendingFood = FOOD_DB.find(f => f.id === foodId);
    openQtyModal(pendingFood);
}

function openQtyModal(food) {
    document.getElementById('modal-emoji').textContent        = food.emoji;
    document.getElementById('modal-food-name').textContent    = food.name;
    document.getElementById('modal-food-kcal-ref').textContent = food.kcal + ' kcal por 100g';
    document.getElementById('modal-meal-name').textContent    = activeMealTab;
    document.getElementById('modal-qty-input').value          = '1';
    document.getElementById('modal-unit-label').textContent   = 'porción(es)';

    // Reset a porciones
    document.getElementById('btn-porciones').classList.add('active');
    document.getElementById('btn-gramos').classList.remove('active');
    activeMealUnit = 'porciones';

    updateModalKcal();
    document.getElementById('qty-modal-backdrop').classList.remove('hidden');
}

function closeQtyModal(e) {
    document.getElementById('qty-modal-backdrop').classList.add('hidden');
    pendingFood = null;
}

let activeMealUnit = 'porciones';

function selectUnit(el, unit) {
    activeMealUnit = unit;
    document.querySelectorAll('.unit-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    document.getElementById('modal-qty-input').value = unit === 'gramos' ? '100' : '1';
    document.getElementById('modal-unit-label').textContent = unit === 'gramos' ? 'gramo(s)' : 'porción(es)';
    updateModalKcal();
}

function stepQty(delta) {
    const input = document.getElementById('modal-qty-input');
    const min   = activeMealUnit === 'gramos' ? 1 : 1;
    const step  = activeMealUnit === 'gramos' ? 10 : 1;
    const val   = Math.max(min, (parseInt(input.value) || 1) + (delta * step));
    input.value = val;
    updateModalKcal();
}

function updateModalKcal() {
    if (!pendingFood) return;
    const qty    = parseFloat(document.getElementById('modal-qty-input').value) || 0;
    const grams  = activeMealUnit === 'gramos' ? qty : qty * 100;
    const kcal   = Math.round(pendingFood.kcal * grams / 100);
    document.getElementById('modal-kcal-preview').textContent = kcal + ' kcal';
}

function confirmAddToDiary() {
    if (!pendingFood) return;
    const qty   = parseFloat(document.getElementById('modal-qty-input').value) || 1;
    const unit  = activeMealUnit;
    const grams = unit === 'gramos' ? qty : qty * 100;
    const key   = activeMealTab + '_' + pendingFood.id;

    if (foodDiary[key]) {
        foodDiary[key].grams += grams;
        foodDiary[key].qty   = unit === 'porciones'
            ? foodDiary[key].grams / 100
            : foodDiary[key].grams;
    } else {
        foodDiary[key] = {
            food:  pendingFood,
            meal:  activeMealTab,
            grams: grams,
            qty:   qty,
            unit:  unit
        };
    }

    closeQtyModal();
    showDiaryToast(pendingFood.emoji + ' ' + pendingFood.name + ' añadido a ' + activeMealTab);
    filterFoods();
    renderDiaryScreen();
}

// ── Diario ────────────────────────────────────
function renderDiaryScreen() {
    const entries = Object.values(foodDiary).filter(e => e.qty > 0);
    const emptyEl = document.getElementById('diary-empty');
    const sectionsEl = document.getElementById('diary-sections');

    // Macros totales
    const totals = entries.reduce((acc, e) => {
        acc.kcal    += e.food.kcal    * e.qty;
        acc.protein += e.food.protein * e.qty;
        acc.carbs   += e.food.carbs   * e.qty;
        return acc;
    }, { kcal: 0, protein: 0, carbs: 0 });

    document.getElementById('d-kcal').textContent    = Math.round(totals.kcal);
    document.getElementById('d-protein').textContent = Math.round(totals.protein);
    document.getElementById('d-carbs').textContent   = Math.round(totals.carbs);
    document.getElementById('d-items').textContent   = entries.reduce((s, e) => s + e.qty, 0);

    if (!entries.length) {
        emptyEl.style.display = 'flex';
        sectionsEl.innerHTML  = '';
        return;
    }
    emptyEl.style.display = 'none';

    // Agrupar por tipo de comida
    const byMeal = {};
    entries.forEach(e => {
        if (!byMeal[e.meal]) byMeal[e.meal] = [];
        byMeal[e.meal].push(e);
    });

    const ORDER = ['Desayuno','Almuerzo','Cena','Snack'];
    sectionsEl.innerHTML = ORDER.filter(m => byMeal[m]).map(meal => {
        const items    = byMeal[meal];
        const mealKcal = Math.round(items.reduce((s, e) => s + e.food.kcal * e.qty, 0));
        const icon     = MEAL_ICONS_FA[meal];
        return `
        <div class="diary-meal-section">
            <div class="diary-meal-title">
                <i class="fa-solid ${icon} text-brand-green"></i>
                ${meal}
                <span class="diary-meal-kcal">${mealKcal} kcal</span>
            </div>
            ${items.map(e => {
                const key      = meal + '_' + e.food.id;
                const itemKcal = Math.round(e.food.kcal * e.qty);
                return `
                <div class="diary-food-row">
                    <span style="font-size:22px;width:36px;text-align:center;flex-shrink:0">${e.food.emoji}</span>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-semibold text-brand-dark">${e.food.name}</p>
<p class="text-[11px] text-gray-400 mt-0.5">
    ${e.unit === 'gramos'
        ? Math.round(e.grams) + 'g'
        : e.qty + ' porción' + (e.qty !== 1 ? 'es' : '') + ' (' + Math.round(e.grams) + 'g)'
    } · ${Math.round(e.food.kcal * e.grams / 100)} kcal
</p>
                    </div>
                    <div class="df-counter">
                        <button class="df-counter-btn remove"
                                onclick="changeDiaryQty('${key}', -1)"
                                aria-label="Reducir o eliminar">
                            <i class="fa-solid ${e.qty === 1 ? 'fa-trash' : 'fa-minus'}"></i>
                        </button>
                        <span class="df-counter-val">${e.qty}</span>
                        <button class="df-counter-btn"
                                onclick="changeDiaryQty('${key}', 1)"
                                aria-label="Aumentar cantidad">
                            <i class="fa-solid fa-plus"></i>
                        </button>
                    </div>
                </div>`;
            }).join('')}
        </div>`;
    }).join('');
}

function changeDiaryQty(key, delta) {
    if (!foodDiary[key]) return;
    foodDiary[key].qty += delta;
    if (foodDiary[key].qty <= 0) delete foodDiary[key];
    renderDiaryScreen();
}

// ── Toast ─────────────────────────────────────
function showDiaryToast(msg) {
    let toast = document.getElementById('diary-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'diary-toast';
        toast.className = 'toast-msg';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('visible');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('visible'), 2200);
}

// Inicializar buscador cuando se navegue a él
// IMPORTANTE: extendemos navTo sin redeclararla como función
const _diaryNavTo = window.navTo || navTo;

window.navTo = function(targetId) {
    // Llamar la navegación original
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
        screen.classList.add('fade-out');
    });
    setTimeout(() => {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('fade-out'));
        document.getElementById(targetId).classList.add('active');
    }, 50);

    // Lógica extra según pantalla
    if (targetId === 'screen-search') {
        setTimeout(() => {
            const input = document.getElementById('search-input');
            if (input) {
                input.value = '';
                input.focus();
            }
            renderSearchResults(FOOD_DB);
        }, 100);
    }

    if (targetId === 'screen-diary') {
        setTimeout(() => renderDiaryScreen(), 60);
    }

    if (targetId === 'screen-onboarding') {
    setTimeout(() => setDateLimits(), 60);
    }
};
function setDateLimits() {
    const input = document.getElementById('ob-date');
    if (!input) return;

    const today = new Date();

    // Máximo: hace 5 años exactos
    const maxDate = new Date(today.getFullYear() - 12, today.getMonth(), today.getDate());

    // Mínimo: hace 99 años exactos
    const minDate = new Date(today.getFullYear() - 99, today.getMonth(), today.getDate());

    input.max = maxDate.toISOString().split('T')[0];
    input.min = minDate.toISOString().split('T')[0];
}

// ==========================================
// MODAL DE TÉRMINOS Y CONDICIONES
// ==========================================
function openTermsModal(e) {
    e.preventDefault();
    document.getElementById('terms-modal-backdrop').classList.remove('hidden');
}

function closeTermsModal() {
    document.getElementById('terms-modal-backdrop').classList.add('hidden');
}

function acceptTermsAndClose() {
    document.getElementById('terms').checked = true;
    closeTermsModal();
}
// Modo oscuro
function toggleDarkMode() {
    const body = document.body;
    const icon = document.getElementById('dark-mode-icon');
    
    body.classList.toggle('dark-mode');
    
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('darkMode', 'enabled');
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        localStorage.setItem('darkMode', 'disabled');
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
}

// Cargar preferencia de modo oscuro al iniciar
function loadDarkModePreference() {
    const darkMode = localStorage.getItem('darkMode');
    const icon = document.getElementById('dark-mode-icon');
    
    if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
        if (icon) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
    }
}

// Llamar a esta función cuando se carga la página
// Agrega esto al final de tu window.onload o al inicio del script
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadDarkModePreference);
} else {
    loadDarkModePreference();
}