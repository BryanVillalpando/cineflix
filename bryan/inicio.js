let allMovies = [];
let allCategories = [];

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Cargar inicial del perfil
    await loadProfileInitial();

    // Cargar películas
    await loadMovies();

    // Configurar evento de búsqueda
    setupSearchFunctionality();
    
    // Configurar menú desplegable de categorías
    setupCategoriesDropdown();
});

// Función para cargar la inicial del perfil
async function loadProfileInitial() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('https://cineflix-api-zr5o.onrender.com/api/users/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Error al obtener perfil');
        }

        const user = await response.json();
        const initial = (user.name?.[0] || user.username?.[0] || 'U').toUpperCase();
        document.getElementById('profileInitial').textContent = initial;
    } catch (error) {
        console.error('Error al obtener perfil:', error);
    }
}

// Función para cargar y mostrar películas
async function loadMovies() {
    try {
        const response = await fetch('https://cineflix-api-zr5o.onrender.com/api/movies');

        if (!response.ok) {
            throw new Error('Error al cargar películas');
        }

        const movies = await response.json();
        allMovies = movies; // Guardamos todas para buscar luego
        renderMovies(allMovies);
    } catch (error) {
        console.error('Error cargando películas:', error);
        document.getElementById('featuredMovies').innerHTML = '<p style="color: white;">Error al cargar películas. Intente más tarde.</p>';
    }
}

// Función para renderizar películas
function renderMovies(movies) {
    const featuredContainer = document.getElementById('featuredMovies');
    const horrorContainer = document.getElementById('horrorMovies');
    const actionContainer = document.getElementById('actionMovies');
const dramaContainer = document.getElementById('dramaMovies');
const comedyContainer = document.getElementById('comedyMovies');

    // Limpiar contenedores
    featuredContainer.innerHTML = '';
    horrorContainer.innerHTML = '';
    actionContainer.innerHTML = '';
dramaContainer.innerHTML = '';
comedyContainer.innerHTML = '';
    // Ordenar películas por fecha
    const sortedMovies = [...movies].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Destacadas
    sortedMovies.slice(0, 6).forEach(movie => {
        featuredContainer.innerHTML += createMovieCard(movie);
    });

    // Terror
    const horrorMovies = movies.filter(movie =>
        movie.genre && movie.genre.some(g => g.toLowerCase().includes('terror'))
    ).slice(0, 6);

    horrorMovies.forEach(movie => {
        horrorContainer.innerHTML += createMovieCard(movie);
    });
    // Acción
const actionMovies = movies.filter(movie =>
    movie.genre && movie.genre.some(g => g.toLowerCase().includes('accion') || g.toLowerCase().includes('acción'))
).slice(0, 6);

actionMovies.forEach(movie => {
    actionContainer.innerHTML += createMovieCard(movie);
});

// Drama
const dramaMovies = movies.filter(movie =>
    movie.genre && movie.genre.some(g => g.toLowerCase().includes('drama'))
).slice(0, 6);

dramaMovies.forEach(movie => {
    dramaContainer.innerHTML += createMovieCard(movie);
});

// Comedia
const comedyMovies = movies.filter(movie =>
    movie.genre && movie.genre.some(g => g.toLowerCase().includes('comedia'))
).slice(0, 6);

comedyMovies.forEach(movie => {
    comedyContainer.innerHTML += createMovieCard(movie);
});
}

// Función para renderizar resultados de búsqueda
function renderSearchResults(results) {
const featuredContainer = document.getElementById('featuredMovies');
const horrorContainer = document.getElementById('horrorMovies');
const actionContainer = document.getElementById('actionMovies');
const dramaContainer = document.getElementById('dramaMovies');
const comedyContainer = document.getElementById('comedyMovies');
const featuredSection = document.getElementById('featuredSection');
const horrorSection = document.getElementById('horrorSection');
const actionSection = document.getElementById('actionSection');
const dramaSection = document.getElementById('dramaSection');
const comedySection = document.getElementById('comedySection');

// Mostrar sección de destacados para resultados
featuredSection.style.display = '';
featuredSection.querySelector('h2').textContent = 'Resultados de búsqueda';

// Ocultar las demás secciones durante la búsqueda
horrorSection.style.display = 'none';
actionSection.style.display = 'none';
dramaSection.style.display = 'none';
comedySection.style.display = 'none';

// Limpiar contenedor de destacados para mostrar resultados
featuredContainer.innerHTML = '';
horrorContainer.innerHTML = '';
actionContainer.innerHTML = '';
dramaContainer.innerHTML = '';
comedyContainer.innerHTML = '';

if (results.length === 0) {
    featuredContainer.innerHTML = '<p style="color: white; text-align: center; width: 100%;">No se encontraron resultados.</p>';
    return;
}

results.forEach(movie => {
    featuredContainer.innerHTML += createMovieCard(movie);
});
}

// Crear tarjeta de película
function createMovieCard(movie) {
    return `
        <div class="pelicula">
            <a href="detalle.html?id=${movie._id}">
                <img src="${movie.posterUrl}" alt="${movie.title}" onerror="this.src='placeholder.jpg'">
                <div class="titulo">${movie.title}</div>
            </a>
        </div>
    `;
}

// Configurar funcionalidad de búsqueda

function setupSearchFunctionality() {
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
if (!searchInput || !searchButton) {
    console.error('Elementos de búsqueda no encontrados');
    return;
}

// Función de búsqueda
function performSearch() {
    const query = searchInput.value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Elimina tildes
        .trim();

    const featuredSection = document.getElementById('featuredSection');
    const horrorSection = document.getElementById('horrorSection');
    const actionSection = document.getElementById('actionSection');
    const dramaSection = document.getElementById('dramaSection');
    const comedySection = document.getElementById('comedySection');

    if (query === '') {
        // Restaurar vista normal
        featuredSection.querySelector('h2').textContent = 'Películas destacadas';
        featuredSection.style.display = '';
        horrorSection.style.display = '';
        actionSection.style.display = '';
        dramaSection.style.display = '';
        comedySection.style.display = '';
        renderMovies(allMovies);
    } else {
        // Mostrar resultados de búsqueda
        const filtered = allMovies.filter(movie => {
            const title = movie.title
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '');
            return title.includes(query);
        });

        renderSearchResults(filtered);
    }
}

// Evento al hacer click en el botón de búsqueda
searchButton.addEventListener('click', performSearch);

// Evento al presionar Enter en el input
searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        performSearch();
    }
});

// Evento al escribir en el input (búsqueda en tiempo real)
searchInput.addEventListener('input', () => {
    // Esperar un momento antes de buscar para evitar muchas búsquedas mientras el usuario escribe
    clearTimeout(searchInput.searchTimeout);
    searchInput.searchTimeout = setTimeout(performSearch, 300);
});
}

// Función para configurar el dropdown de categorías
function setupCategoriesDropdown() {
    const categoriesButton = document.getElementById('categoriesButton');
    const categoriesMenu = document.getElementById('categoriesMenu');
    
    if (!categoriesButton || !categoriesMenu) {
        console.error('No se encontraron elementos de categorías');
        return;
    }
    
    // Extraer todas las categorías únicas
    allCategories = getAllCategories();
    
    // Renderizar categorías en el menú
    renderCategoriesMenu(allCategories);
    
    // Mostrar/ocultar menú al hacer clic
    categoriesButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        categoriesMenu.classList.toggle('show');
    });
    
    // Ocultar menú al hacer clic fuera
    document.addEventListener('click', () => {
        categoriesMenu.classList.remove('show');
    });
    
    categoriesMenu.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

// Función para obtener todas las categorías únicas
function getAllCategories() {
    const categoriesSet = new Set();
    
    allMovies.forEach(movie => {
        if (movie.genre && Array.isArray(movie.genre)) {
            movie.genre.forEach(g => {
                if (g) categoriesSet.add(g.trim().toLowerCase());
            });
        }
    });
    
    return Array.from(categoriesSet).sort();
}

// Función para renderizar el menú de categorías
function renderCategoriesMenu(categories) {
    const categoriesMenu = document.getElementById('categoriesMenu');
    
    if (!categoriesMenu) {
        console.error('Elemento categoriesMenu no encontrado');
        return;
    }
    
    categoriesMenu.innerHTML = '';
    
    // Agregar opción "Todas"
    const allItem = document.createElement('a');
    allItem.href = '#';
    allItem.textContent = 'Todas las categorías';
    allItem.addEventListener('click', (e) => {
        e.preventDefault();
        filterMoviesByCategory('');
    });
    categoriesMenu.appendChild(allItem);
    
    // Agregar cada categoría
    categories.forEach(category => {
        const categoryItem = document.createElement('a');
        categoryItem.href = '#';
        categoryItem.textContent = capitalizeFirstLetter(category);
        categoryItem.addEventListener('click', (e) => {
            e.preventDefault();
            filterMoviesByCategory(category);
        });
        categoriesMenu.appendChild(categoryItem);
    });
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Función para filtrar películas por categoría
function filterMoviesByCategory(category) {
console.log('Filtrando por categoría:', category);
const featuredSection = document.getElementById('featuredSection');
const horrorSection = document.getElementById('horrorSection');
const actionSection = document.getElementById('actionSection');
const dramaSection = document.getElementById('dramaSection');
const comedySection = document.getElementById('comedySection');

if (!category) {
    // Mostrar todas las películas
    featuredSection.querySelector('h2').textContent = 'Películas destacadas';
    featuredSection.style.display = '';
    horrorSection.style.display = '';
    actionSection.style.display = '';
    dramaSection.style.display = '';
    comedySection.style.display = '';
    renderMovies(allMovies);
    return;
}

// Filtrar películas por categoría
const filteredMovies = allMovies.filter(movie => 
    movie.genre && Array.isArray(movie.genre) && 
    movie.genre.some(g => g && g.toLowerCase() === category.toLowerCase())
);

console.log('Películas filtradas:', filteredMovies.length);

// Mostrar resultados
featuredSection.querySelector('h2').textContent = `Categoría: ${capitalizeFirstLetter(category)}`;
featuredSection.style.display = '';
horrorSection.style.display = 'none';
actionSection.style.display = 'none';
dramaSection.style.display = 'none';
comedySection.style.display = 'none';

const featuredContainer = document.getElementById('featuredMovies');
featuredContainer.innerHTML = '';

if (filteredMovies.length === 0) {
    featuredContainer.innerHTML = '<p style="color: white; text-align: center; width: 100%;">No hay películas en esta categoría.</p>';
} else {
    filteredMovies.forEach(movie => {
        featuredContainer.innerHTML += createMovieCard(movie);
    });
}
}