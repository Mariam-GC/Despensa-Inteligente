const API_URL = 'http://localhost:8080/api/alimentos';
let listaAlimentosGlobal = []; // Copia de respaldo con los nombres nativos de Spring

function inicializarCatalogoBackend() {
    const contenedorCarrusel = document.getElementById('carrusel-recomendados');
    
    fetch(API_URL)
        .then(response => {
            if (!response.ok) throw new Error('Error al conectar con el servidor Spring Boot');
            return response.json();
        })
        .then(alimentos => {
            listaAlimentosGlobal = alimentos; // Guardamos la colección original de MySQL

            // 1. ADAPTACIÓN CRUCIAL: Convertimos las propiedades de la BD al formato que usa tu buscador
            FOOD_DB = alimentos.map(alimento => ({
                id: alimento.id,
                name: alimento.nameEs, // Mapea name_es de tu BD
                emoji: alimento.imageUrl || '🍎', // Mapea image_url de tus updates de SQL
                group: 'Frutas', // Asignamos el grupo Frutas para que tus filtros no salgan vacíos
                kcal: 52, // Valores de macros base estandarizados de forma temporal
                protein: 0.3,
                carbs: 13.8,
                fiber: 2.4,
                fat: 0.2,
                servingDescription: alimento.servingDescription || '1 porción estándar',
                badgeText: alimento.badgeText || 'Verificado'
            }));

            console.log('Catálogo sincronizado exitosamente con el Front:', FOOD_DB);

            // 2. Renderizar las 10 tarjetas del carrusel en el Home
            if (contenedorCarrusel) {
                contenedorCarrusel.innerHTML = '';
                const primerosDiez = FOOD_DB.slice(0, 10);

                primerosDiez.forEach(alimento => {
                    contenedorCarrusel.innerHTML += `
                        <div class="min-w-[140px] bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex flex-col items-center text-center relative overflow-hidden group cursor-pointer hover:border-brand-green/30 transition-all">
                            <div class="absolute top-0 right-0 w-16 h-16 bg-brand-greenLight rounded-bl-full -mr-8 -mt-8 z-0"></div>
                            <div class="w-16 h-16 mb-3 relative z-10 flex items-center justify-center text-4xl">${alimento.emoji}</div>
                            <h4 class="font-bold text-brand-dark relative z-10 text-sm truncate w-full">${alimento.name}</h4>
                            <span class="text-[10px] font-medium text-brand-greenDark bg-brand-greenLight px-2 py-1 rounded-md mt-2 relative z-10">${alimento.badgeText}</span>
                        </div>
                    `;
                });
            }

            // 3. Forzar al buscador a refrescarse con los datos reales de la BD
            if (typeof filterFoods === 'function') {
                filterFoods();
            }

            // 4. Activar escuchas del modal "Ver más"
            configurarManejadoresModal();
        })
        .catch(error => {
            console.error('Error de conexión en API.js:', error);
            // Modo Resiliente: Si tu backend está apagado, rinde una manzana de contingencia para que no quede en blanco
            FOOD_DB = [{ id: 1, name: 'Manzana (Offline)', emoji: '🍎', group: 'Frutas', kcal: 52, protein: 0.3, carbs: 13.8, fiber: 2.4, fat: 0.2, badgeText: 'Modo seguro' }];
            if (typeof filterFoods === 'function') filterFoods();
        });
}

function configurarManejadoresModal() {
    const modal = document.getElementById('modal-alimentos');
    const btnVerMas = document.getElementById('btn-ver-mas');
    const btnCerrar = document.getElementById('btn-cerrar-modal');
    const listaModal = document.getElementById('lista-modal-completa');

    if (!modal || !btnVerMas || !btnCerrar || !listaModal) return;

    btnVerMas.addEventListener('click', (e) => {
        e.preventDefault();
        listaModal.innerHTML = '';

        // Renderizado del catálogo completo de tus 20 alimentos de MySQL en el modal
        FOOD_DB.forEach(alimento => {
            listaModal.innerHTML += `
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-2xl hover:bg-brand-greenLight/30 transition-colors border border-gray-100">
                    <div class="flex items-center space-x-3">
                        <span class="text-3xl">${alimento.emoji}</span>
                        <div>
                            <h4 class="font-bold text-brand-dark text-sm">${alimento.name}</h4>
                            <p class="text-[11px] text-gray-400">${alimento.servingDescription}</p>
                        </div>
                    </div>
                    <span class="text-[9px] font-semibold text-brand-greenDark bg-brand-greenLight px-2 py-1 rounded-md">${alimento.badgeText}</span>
                </div>
            `;
        });

        modal.classList.remove('hidden');
    });

    btnCerrar.addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });
}

// Inicializar la sincronización Front-Back en cuanto cargue el árbol DOM
document.addEventListener('DOMContentLoaded', () => {
    inicializarCatalogoBackend();
});