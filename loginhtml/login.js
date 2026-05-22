// Cargar usuarios desde localStorage, con usuario por defecto si no existe
let usersDB = JSON.parse(localStorage.getItem('usersDB')) || [
    { name: 'Ana García', email: 'ana@correo.com', user: 'ana_garcia', password: 'Password123' }
];

function saveUsersDB() {
    localStorage.setItem('usersDB', JSON.stringify(usersDB));
}

// ==========================================
// RECIENTES EN HOME
// ==========================================
let recentFoods = JSON.parse(localStorage.getItem('recentFoods')) || [];
let foodDiary = {};
let activeMealTab = 'Desayuno';
let activeMealUnit = 'porciones';

function getFoodColor(group) {
    const colors = {
        'Frutas': '#fca5a5',
        'Verduras': '#86efac',
        'Cereales': '#fde047',
        'Leguminosas': '#c084fc',
        'Carnes': '#f97316',
        'Pescados': '#60a5fa',
        'Nueces': '#d97706',
        'Semillas': '#a3e635'
    };
    return colors[group] || '#94a3b8';
}

function updateHomeRecents() {
    const recentsContainer = document.getElementById('recent-list');
    if (!recentsContainer) return;
    
    if (recentFoods.length === 0) {
        recentsContainer.innerHTML = `
            <div class="text-center py-8 text-brand-gray">
                <i class="fa-solid fa-utensils text-3xl mb-2 opacity-50"></i>
                <p class="text-sm">Aún no has agregado alimentos</p>
            </div>
        `;
        return;
    }
    
    recentsContainer.innerHTML = recentFoods.map(food => `
        <div class="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex items-center cursor-pointer hover:shadow-md transition-all"
             onclick='openPostIntake(${JSON.stringify({ 
                 name: food.name, 
                 emoji: food.emoji, 
                 kcal: food.kcal, 
                 protein: food.protein, 
                 carbs: food.carbs, 
                 fiber: food.fiber || 0, 
                 grams: 100 
             })})'>
            <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mr-4" style="background-color: ${getFoodColor(food.group)}20">
                ${food.emoji}
            </div>
            <div class="flex-1">
                <h4 class="font-bold text-brand-dark">${food.name}</h4>
                <p class="text-xs text-brand-gray mt-0.5">${food.kcal} kcal • ${food.protein}g prot • ${food.carbs}g carbs</p>
            </div>
            <i class="fa-solid fa-chevron-right text-gray-300 text-sm"></i>
        </div>
    `).join('');
}

function addToRecent(food) {
    recentFoods = recentFoods.filter(f => f.id !== food.id);
    recentFoods.unshift(food);
    recentFoods = recentFoods.slice(0, 10);
    localStorage.setItem('recentFoods', JSON.stringify(recentFoods));
    updateHomeRecents();
}

function clearRecents() {
    if (confirm('¿Deseas borrar todos tus alimentos recientes?')) {
        recentFoods = [];
        localStorage.setItem('recentFoods', JSON.stringify(recentFoods));
        updateHomeRecents();
        showToast('Lista de recientes limpiada');
    }
}

function saveDiaryToLocal() {
    localStorage.setItem('foodDiary', JSON.stringify(foodDiary));
}

function loadDiaryFromLocal() {
    const saved = localStorage.getItem('foodDiary');
    if (saved) {
        foodDiary = JSON.parse(saved);
    }
}

function showToast(msg) {
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

// ==========================================
// NAVEGACIÓN Y UI
// ==========================================
function navTo(targetId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
        screen.classList.add('fade-out');
    });

    setTimeout(() => {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('fade-out'));
        const targetScreen = document.getElementById(targetId);
        if (targetScreen) targetScreen.classList.add('active');
        
        if (targetId === 'screen-home') {
            updateHomeRecents();
        }
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

function toggleChip(element, isRadioMode = false) {
    if (isRadioMode) {
        element.parentElement.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        element.classList.add('active');
    } else {
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

    s1.style.backgroundColor = '#e2e8f0';
    s2.style.backgroundColor = '#e2e8f0';
    s3.style.backgroundColor = '#e2e8f0';
    s4.style.backgroundColor = '#e2e8f0';

    if (strength >= 1) s1.style.backgroundColor = '#ef4444';
    if (strength >= 2) s2.style.backgroundColor = '#ef4444';
    if (strength >= 3) {
        s1.style.backgroundColor = '#eab308';
        s2.style.backgroundColor = '#eab308';
        s3.style.backgroundColor = '#eab308';
    }
    if (strength === 4) {
        s1.style.backgroundColor = '#4ade80';
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
    errorMsg.style.display = (p2.length > 0 && p1 !== p2) ? 'block' : 'none';
    checkFormValidity();
}

function checkFormValidity() {
    const emailError = document.getElementById('error-email').style.display === 'block';
    const userError = document.getElementById('error-user').style.display === 'block';
    const matchError = document.getElementById('error-password-match').style.display === 'block';
    const p1 = document.getElementById('reg-password').value;
    const btn = document.getElementById('btn-next-1');
    if (btn) btn.disabled = (emailError || userError || matchError || p1.length < 8);
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

    currentRegistrationData = {
        name: document.getElementById('reg-name').value,
        email: document.getElementById('reg-email').value,
        user: document.getElementById('reg-user').value.replace('@', ''),
        password: p1
    };
    navTo('screen-onboarding');
}

// ==========================================
// LÓGICA DE SALUD
// ==========================================
function calculateIMC() {
    const weight = parseFloat(document.getElementById('ob-weight').value);
    const height = parseFloat(document.getElementById('ob-height').value);
    const imcDisplay = document.getElementById('imc-value');
    if (weight > 0 && height > 0) {
        imcDisplay.innerText = (weight / (height * height)).toFixed(1);
    } else {
        imcDisplay.innerText = '--';
    }
}

function handleRegisterComplete(e) {
    e.preventDefault();
    const birthDateVal = document.getElementById('ob-date').value;
    if (!birthDateVal) {
        alert('Por favor ingresa tu fecha de nacimiento.');
        return;
    }
    const birthDate = new Date(birthDateVal);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    if (age < 12) {
        alert('La edad mínima es 12 años.');
        return;
    }
    if (age > 99) {
        alert('La edad máxima es 99 años.');
        return;
    }

    const condition = document.querySelector('#chips-condition .active')?.innerText;
    const goals = Array.from(document.querySelectorAll('#chips-goals .active')).map(c => c.innerText);

    const finalUserData = {
        ...currentRegistrationData,
        birthDate: birthDateVal,
        gender: document.getElementById('ob-gender').value,
        weight: document.getElementById('ob-weight').value,
        height: document.getElementById('ob-height').value,
        condition: condition,
        goals: goals
    };

    usersDB.push(finalUserData);
    saveUsersDB();
    loadUserData(finalUserData);
    navTo('screen-home');
}

// ==========================================
// LOGIN
// ==========================================
function handleLogin(e) {
    e.preventDefault();
    const emailInput = document.getElementById('login-email').value.trim();
    const passInput = document.getElementById('login-password').value;
    const errorMsg = document.getElementById('login-error');

    if (!emailInput || !passInput) {
        errorMsg.innerText = 'Completa todos los campos.';
        errorMsg.style.display = 'block';
        return;
    }

    const userExists = usersDB.find(u => u.email === emailInput || u.user === emailInput);
    if (!userExists) {
        errorMsg.innerText = 'Usuario no registrado.';
        errorMsg.style.display = 'block';
        return;
    }
    if (userExists.password !== passInput) {
        errorMsg.innerText = 'Contraseña incorrecta.';
        errorMsg.style.display = 'block';
        return;
    }

    errorMsg.style.display = 'none';
    loadUserData(userExists);
    navTo('screen-home');
}

function loadUserData(user) {
    const usernameEl = document.getElementById('home-username');
    if (usernameEl) {
        usernameEl.innerText = user.name.split(' ')[0] + ' ' + (user.name.split(' ')[1] || '');
    }
    const nameParam = encodeURIComponent(user.name);
    const avatarEl = document.getElementById('home-avatar');
    if (avatarEl) {
        avatarEl.src = `https://ui-avatars.com/api/?name=${nameParam}&background=bae6fd&color=1e293b`;
    }
}

function logout() {
    if (confirm('¿Deseas cerrar sesión?')) {
        navTo('screen-login');
    }
}

// ==========================================
// POST-INGESTA
// ==========================================
let currentPostIntakeFood = null;

function openPostIntake(foodData) {
    currentPostIntakeFood = foodData;
    const emojiEl = document.getElementById('pi-emoji');
    const nameEl = document.getElementById('pi-food-name');
    if (emojiEl) emojiEl.textContent = foodData.emoji || '🍽️';
    if (nameEl) nameEl.textContent = foodData.name || 'Alimento';

    const macrosEl = document.getElementById('pi-macros');
    if (macrosEl) {
        macrosEl.innerHTML = '';
        if (foodData.kcal) macrosEl.innerHTML += `<span class="pi-macro-pill">${foodData.kcal} kcal</span>`;
        if (foodData.protein) macrosEl.innerHTML += `<span class="pi-macro-pill">${foodData.protein}g proteína</span>`;
        if (foodData.carbs) macrosEl.innerHTML += `<span class="pi-macro-pill">${foodData.carbs}g carbs</span>`;
        if (foodData.fiber) macrosEl.innerHTML += `<span class="pi-macro-pill">${foodData.fiber}g fibra</span>`;
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    const timeLabel = document.getElementById('pi-time-label');
    if (timeLabel) timeLabel.textContent = `Hoy, ${timeStr} · ${foodData.grams || 100}g`;

    resetPostIntakeForm();
    navTo('screen-post-intake');
}

function togglePiChip(el, colorClass) {
    el.classList.toggle('active-' + colorClass);
}

function selectTiming(el) {
    document.querySelectorAll('#timing-btns .pi-timing-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
}

function updateCharCount() {
    const val = document.getElementById('pi-notes').value.length;
    const countEl = document.getElementById('pi-char-count');
    if (countEl) countEl.textContent = `${val} / 300`;
}

function submitPostIntake() {
    const getSelected = (groupId) =>
        [...document.querySelectorAll(`#${groupId} .pi-chip[class*="active-"]`)].map(c => c.dataset.val);
    const timingEl = document.querySelector('#timing-btns .pi-timing-btn.active');

    const postIntakeData = {
        food: currentPostIntakeFood,
        physical_states: getSelected('chips-fisico'),
        emotional_states: getSelected('chips-emocional'),
        digestive_states: getSelected('chips-digestivo'),
        skin_symptoms: getSelected('chips-piel'),
        symptom_timing: timingEl ? timingEl.textContent.trim() : 'Inmediatamente',
        notes: document.getElementById('pi-notes').value.trim(),
        recorded_at: new Date().toISOString()
    };

    console.log('Post-ingesta guardada:', postIntakeData);
    const allSelected = [...postIntakeData.physical_states, ...postIntakeData.emotional_states, ...postIntakeData.digestive_states, ...postIntakeData.skin_symptoms];
    const msg = allSelected.length > 0 ? `Registramos: ${allSelected.join(', ')}.` : 'Tu reacción ha sido registrada.';

    const successMsg = document.getElementById('pi-success-msg');
    const successDiv = document.getElementById('pi-success');
    if (successMsg) successMsg.textContent = msg;
    if (successDiv) {
        successDiv.classList.remove('hidden');
        successDiv.classList.add('flex');
    }
}

function resetPostIntakeForm() {
    document.querySelectorAll('.pi-chip[class*="active-"]').forEach(c => {
        c.className = 'pi-chip';
    });
    document.querySelectorAll('#timing-btns .pi-timing-btn').forEach((b, i) => {
        b.classList.toggle('active', i === 0);
    });
    const notesEl = document.getElementById('pi-notes');
    if (notesEl) notesEl.value = '';
    const countEl = document.getElementById('pi-char-count');
    if (countEl) countEl.textContent = '0 / 300';
    const successDiv = document.getElementById('pi-success');
    if (successDiv) {
        successDiv.classList.add('hidden');
        successDiv.classList.remove('flex');
    }
}

// ==========================================
// BASE DE DATOS DE ALIMENTOS
// ==========================================
const FOOD_DB = [
    { id:1, name:'Manzana', emoji:'🍎', group:'Frutas', kcal:52, protein:0.3, carbs:13.8, fiber:2.4, fat:0.2 },
    { id:2, name:'Plátano', emoji:'🍌', group:'Frutas', kcal:89, protein:1.1, carbs:22.8, fiber:2.6, fat:0.3 },
    { id:3, name:'Aguacate', emoji:'🥑', group:'Frutas', kcal:160, protein:2.0, carbs:8.5, fiber:6.7, fat:14.7 },
    { id:4, name:'Arándano', emoji:'🫐', group:'Frutas', kcal:57, protein:0.7, carbs:14.5, fiber:2.4, fat:0.3 },
    { id:5, name:'Fresa', emoji:'🍓', group:'Frutas', kcal:32, protein:0.7, carbs:7.7, fiber:2.0, fat:0.3 },
    { id:6, name:'Brócoli', emoji:'🥦', group:'Verduras', kcal:34, protein:2.8, carbs:6.6, fiber:2.6, fat:0.4 },
    { id:7, name:'Espinaca', emoji:'🍃', group:'Verduras', kcal:23, protein:2.9, carbs:3.6, fiber:2.2, fat:0.4 },
    { id:8, name:'Zanahoria', emoji:'🥕', group:'Verduras', kcal:41, protein:0.9, carbs:9.6, fiber:2.8, fat:0.2 },
    { id:9, name:'Jitomate', emoji:'🍅', group:'Verduras', kcal:18, protein:0.9, carbs:3.9, fiber:1.2, fat:0.2 },
    { id:10, name:'Nopal', emoji:'🌵', group:'Verduras', kcal:16, protein:1.3, carbs:3.3, fiber:2.2, fat:0.1 },
    { id:11, name:'Avena', emoji:'🌾', group:'Cereales', kcal:379, protein:13.2, carbs:67.7, fiber:10.1, fat:6.5 },
    { id:12, name:'Tortilla de maíz', emoji:'🫓', group:'Cereales', kcal:218, protein:5.7, carbs:45.9, fiber:6.5, fat:2.9 },
    { id:13, name:'Arroz blanco', emoji:'🍚', group:'Cereales', kcal:130, protein:2.7, carbs:28.2, fiber:0.4, fat:0.3 },
    { id:14, name:'Frijoles negros', emoji:'🫘', group:'Leguminosas', kcal:132, protein:8.9, carbs:23.7, fiber:8.7, fat:0.5 },
    { id:15, name:'Lentejas', emoji:'🫘', group:'Leguminosas', kcal:116, protein:9.0, carbs:20.1, fiber:7.9, fat:0.4 },
    { id:16, name:'Pechuga de pollo', emoji:'🍗', group:'Carnes', kcal:165, protein:31.0, carbs:0.0, fiber:0.0, fat:3.6 },
    { id:17, name:'Huevo entero', emoji:'🥚', group:'Carnes', kcal:155, protein:12.6, carbs:1.1, fiber:0.0, fat:10.6 },
    { id:18, name:'Salmón cocido', emoji:'🐟', group:'Pescados', kcal:206, protein:30.5, carbs:0.0, fiber:0.0, fat:9.0 },
    { id:19, name:'Almendras', emoji:'🥜', group:'Nueces', kcal:579, protein:21.2, carbs:21.6, fiber:12.5, fat:49.9 },
    { id:20, name:'Semilla de chía', emoji:'🌱', group:'Semillas', kcal:486, protein:16.5, carbs:42.1, fiber:34.4, fat:30.7 },
];

const MEAL_ICONS_FA = { Desayuno: 'fa-sun', Almuerzo: 'fa-cloud-sun', Cena: 'fa-moon', Snack: 'fa-apple-whole' };
let pendingFood = null;

// ==========================================
// BUSCADOR
// ==========================================
function selectMealTab(el, meal) {
    activeMealTab = meal;
    document.querySelectorAll('.meal-tab-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    filterFoods();
}

function filterFoods() {
    const q = (document.getElementById('search-input').value || '').toLowerCase().trim();
    const filtered = q ? FOOD_DB.filter(f => f.name.toLowerCase().includes(q) || f.group.toLowerCase().includes(q)) : FOOD_DB;
    renderSearchResults(filtered);
}

function renderSearchResults(foods) {
    const container = document.getElementById('search-results');
    if (!container) return;
    
    if (!foods.length) {
        container.innerHTML = `<div class="flex flex-col items-center py-16 text-gray-400"><i class="fa-solid fa-magnifying-glass text-3xl mb-3"></i><p class="text-sm">Sin resultados</p></div>`;
        return;
    }
    
    const groups = {};
    foods.forEach(f => { if (!groups[f.group]) groups[f.group] = []; groups[f.group].push(f); });
    
    container.innerHTML = Object.entries(groups).map(([grp, items]) => `
        <p class="search-group-label">${grp}</p>
        ${items.map(f => { 
            const key = activeMealTab + '_' + f.id; 
            const added = !!foodDiary[key];
            return `<div class="food-search-card">
                <div class="fs-emoji">${f.emoji}</div>
                <div class="flex-1 min-w-0">
                    <p class="font-semibold text-brand-dark text-sm">${f.name}</p>
                    <p class="text-[11px] text-gray-400 mt-0.5">${f.group} · por 100g</p>
                    <p class="text-[12px] text-brand-greenDark font-medium mt-0.5">${f.kcal} kcal · ${f.protein}g prot · ${f.carbs}g carbs</p>
                </div>
                <button class="fs-add-btn ${added ? 'added' : ''}" onclick="addToDiary(${f.id})">
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
    const modalEmoji = document.getElementById('modal-emoji');
    const modalName = document.getElementById('modal-food-name');
    const modalKcalRef = document.getElementById('modal-food-kcal-ref');
    const modalMealName = document.getElementById('modal-meal-name');
    const modalQtyInput = document.getElementById('modal-qty-input');
    const modalUnitLabel = document.getElementById('modal-unit-label');
    const btnPorciones = document.getElementById('btn-porciones');
    const btnGramos = document.getElementById('btn-gramos');
    const modalBackdrop = document.getElementById('qty-modal-backdrop');
    
    if (modalEmoji) modalEmoji.textContent = food.emoji;
    if (modalName) modalName.textContent = food.name;
    if (modalKcalRef) modalKcalRef.textContent = food.kcal + ' kcal por 100g';
    if (modalMealName) modalMealName.textContent = activeMealTab;
    if (modalQtyInput) modalQtyInput.value = '1';
    if (modalUnitLabel) modalUnitLabel.textContent = 'porción(es)';
    if (btnPorciones) btnPorciones.classList.add('active');
    if (btnGramos) btnGramos.classList.remove('active');
    
    activeMealUnit = 'porciones';
    updateModalKcal();
    if (modalBackdrop) modalBackdrop.classList.remove('hidden');
}

function closeQtyModal(e) {
    const modalBackdrop = document.getElementById('qty-modal-backdrop');
    if (modalBackdrop) modalBackdrop.classList.add('hidden');
    pendingFood = null;
}

function selectUnit(el, unit) {
    activeMealUnit = unit;
    document.querySelectorAll('.unit-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    const qtyInput = document.getElementById('modal-qty-input');
    const unitLabel = document.getElementById('modal-unit-label');
    if (qtyInput) qtyInput.value = unit === 'gramos' ? '100' : '1';
    if (unitLabel) unitLabel.textContent = unit === 'gramos' ? 'gramo(s)' : 'porción(es)';
    updateModalKcal();
}

function stepQty(delta) {
    const input = document.getElementById('modal-qty-input');
    if (!input) return;
    const step = activeMealUnit === 'gramos' ? 10 : 1;
    let val = (parseInt(input.value) || 1) + (delta * step);
    if (val < 1) val = 1;
    input.value = val;
    updateModalKcal();
}

function updateModalKcal() {
    if (!pendingFood) return;
    const qtyInput = document.getElementById('modal-qty-input');
    const kcalPreview = document.getElementById('modal-kcal-preview');
    if (!qtyInput || !kcalPreview) return;
    
    const qty = parseFloat(qtyInput.value) || 0;
    const grams = activeMealUnit === 'gramos' ? qty : qty * 100;
    const kcal = Math.round(pendingFood.kcal * grams / 100);
    kcalPreview.textContent = kcal + ' kcal';
}

function confirmAddToDiary() {
    if (!pendingFood) return;
    
    const qtyInput = document.getElementById('modal-qty-input');
    if (!qtyInput) return;
    
    const qty = parseFloat(qtyInput.value) || 1;
    const unit = activeMealUnit;
    const grams = unit === 'gramos' ? qty : qty * 100;
    const key = activeMealTab + '_' + pendingFood.id;

    if (foodDiary[key]) {
        foodDiary[key].grams += grams;
        foodDiary[key].qty = foodDiary[key].grams / 100;
    } else {
        foodDiary[key] = { 
            food: pendingFood, 
            meal: activeMealTab, 
            grams: grams, 
            qty: unit === 'porciones' ? qty : grams, 
            unit: unit 
        };
    }
    
    addToRecent(pendingFood);
    saveDiaryToLocal();
    closeQtyModal();
    showToast(pendingFood.emoji + ' ' + pendingFood.name + ' añadido a ' + activeMealTab);
    filterFoods();
    renderDiaryScreen();
}

// ==========================================
// DIARIO - RENDER Y CONTADORES
// ==========================================
function renderDiaryScreen() {
    const entries = Object.values(foodDiary).filter(e => e && e.qty > 0);
    const emptyEl = document.getElementById('diary-empty');
    const sectionsEl = document.getElementById('diary-sections');

    // Calcular totales
    const totals = entries.reduce((acc, e) => {
        const factor = e.grams / 100;
        acc.kcal += e.food.kcal * factor;
        acc.protein += e.food.protein * factor;
        acc.carbs += e.food.carbs * factor;
        acc.fat += (e.food.fat || 0) * factor;
        return acc;
    }, { kcal: 0, protein: 0, carbs: 0, fat: 0 });

    // Actualizar resumen
    const kcalEl = document.getElementById('d-kcal');
    const proteinEl = document.getElementById('d-protein');
    const carbsEl = document.getElementById('d-carbs');
    const fatEl = document.getElementById('d-fat');
    const itemsEl = document.getElementById('d-items');
    
    if (kcalEl) kcalEl.textContent = Math.round(totals.kcal);
    if (proteinEl) proteinEl.textContent = Math.round(totals.protein);
    if (carbsEl) carbsEl.textContent = Math.round(totals.carbs);
    if (fatEl) fatEl.textContent = Math.round(totals.fat);
    if (itemsEl) itemsEl.textContent = entries.reduce((s, e) => s + (e.unit === 'gramos' ? e.grams/100 : e.qty), 0);

    // Mostrar vacío o contenido
    if (!entries.length) {
        if (emptyEl) emptyEl.style.display = 'flex';
        if (sectionsEl) sectionsEl.innerHTML = '';
        return;
    }
    if (emptyEl) emptyEl.style.display = 'none';

    // Agrupar por comida
    const byMeal = {};
    entries.forEach(e => { if (!byMeal[e.meal]) byMeal[e.meal] = []; byMeal[e.meal].push(e); });
    const ORDER = ['Desayuno', 'Almuerzo', 'Cena', 'Snack'];
    
    if (sectionsEl) {
        sectionsEl.innerHTML = ORDER.filter(m => byMeal[m]).map(meal => {
            const items = byMeal[meal];
            const mealKcal = Math.round(items.reduce((s, e) => s + e.food.kcal * (e.grams/100), 0));
            const icon = MEAL_ICONS_FA[meal];
            return `<div class="diary-meal-section">
                <div class="diary-meal-title">
                    <i class="fa-solid ${icon} text-brand-green"></i>
                    ${meal}
                    <span class="diary-meal-kcal">${mealKcal} kcal</span>
                </div>
                ${items.map(e => {
                    const key = meal + '_' + e.food.id;
                    const grams = Math.round(e.grams);
                    const kcal = Math.round(e.food.kcal * (grams/100));
                    const protein = Math.round(e.food.protein * (grams/100));
                    const carbs = Math.round(e.food.carbs * (grams/100));
                    const fat = Math.round((e.food.fat || 0) * (grams/100));
                    const displayQty = e.unit === 'gramos' ? Math.round(e.grams) : parseFloat(e.qty.toFixed(1));
                    const qtyText = e.unit === 'gramos' ? displayQty + 'g' : displayQty + ' porción' + (displayQty !== 1 ? 'es' : '');
                    return `<div class="diary-food-row">
                        <span style="font-size:22px;width:36px;text-align:center;flex-shrink:0">${e.food.emoji}</span>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-semibold text-brand-dark">${e.food.name}</p>
                            <div class="flex flex-wrap gap-2 mt-1">
                                <span class="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">🔥 ${kcal} kcal</span>
                                <span class="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full">💪 ${protein}g</span>
                                <span class="text-[10px] bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full">🍚 ${carbs}g</span>
                                <span class="text-[10px] bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full">🧈 ${fat}g</span>
                            </div>
                            <p class="text-[10px] text-gray-400 mt-1">${qtyText}</p>
                        </div>
                        <div class="df-counter">
                            <button class="df-counter-btn remove" onclick="changeDiaryQty('${key}', -1)">
                                <i class="fa-solid ${displayQty <= (e.unit === 'gramos' ? 10 : 0.5) ? 'fa-trash' : 'fa-minus'}"></i>
                            </button>
                            <span class="df-counter-val">${displayQty}</span>
                            <button class="df-counter-btn" onclick="changeDiaryQty('${key}', 1)">
                                <i class="fa-solid fa-plus"></i>
                            </button>
                        </div>
                    </div>`;
                }).join('')}
            </div>`;
        }).join('');
    }
}

function changeDiaryQty(key, delta) {
    if (!foodDiary[key]) return;
    
    const entry = foodDiary[key];
    const step = entry.unit === 'gramos' ? 10 : 0.5;
    let newQty = parseFloat((entry.qty + (delta * step)).toFixed(1));
    
    if (newQty <= 0) {
        delete foodDiary[key];
    } else {
        entry.qty = newQty;
        entry.grams = entry.unit === 'porciones' ? newQty * 100 : newQty;
    }
    
    saveDiaryToLocal();
    renderDiaryScreen();
    filterFoods(); // Actualiza el estado de los botones en buscador
}

// ==========================================
// UTILIDADES
// ==========================================
function setDateLimits() {
    const input = document.getElementById('ob-date');
    if (!input) return;
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 12, today.getMonth(), today.getDate());
    const minDate = new Date(today.getFullYear() - 99, today.getMonth(), today.getDate());
    input.max = maxDate.toISOString().split('T')[0];
    input.min = minDate.toISOString().split('T')[0];
}

function openTermsModal(e) {
    e.preventDefault();
    const modal = document.getElementById('terms-modal-backdrop');
    if (modal) modal.classList.remove('hidden');
}

function closeTermsModal() {
    const modal = document.getElementById('terms-modal-backdrop');
    if (modal) modal.classList.add('hidden');
}

function acceptTermsAndClose() {
    const termsCheckbox = document.getElementById('terms');
    if (termsCheckbox) termsCheckbox.checked = true;
    closeTermsModal();
}

function toggleDarkMode() {
    const body = document.body;
    const icon = document.getElementById('dark-mode-icon');
    body.classList.toggle('dark-mode');
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('darkMode', 'enabled');
        if (icon) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
    } else {
        localStorage.setItem('darkMode', 'disabled');
        if (icon) {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }
}

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

// ==========================================
// INICIALIZACIÓN
// ==========================================
loadDiaryFromLocal();
recentFoods = JSON.parse(localStorage.getItem('recentFoods')) || [];

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadDarkModePreference);
} else {
    loadDarkModePreference();
}