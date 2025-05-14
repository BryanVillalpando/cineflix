document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    // Verificación inmediata desde localStorage
    if (userData) {
        const user = JSON.parse(userData);
        if (user.role === 'admin') {
            initAdminPanel();
            return;
        }
    }
    
    // Si no hay datos o no es admin, verificar con el backend
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const user = await fetchUserData(token);
        if (user.role !== 'admin') {
            window.location.href = 'inicio.html';
            return;
        }
        
        // Guardar datos actualizados
        localStorage.setItem('user', JSON.stringify(user));
        initAdminPanel();
        
    } catch (error) {
        console.error('Error:', error);
        window.location.href = 'login.html';
    }
});

async function fetchUserData(token) {
    const response = await fetch('https://cineflix-api-zr5o.onrender.com/api/users/me', {
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    
    if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
}

// Inicialización del panel
function initAdminPanel() {
    // Configurar eventos
    setupEventListeners();
    
    // Cargar datos iniciales
    loadInitialData();
    
    // Mostrar sección de películas por defecto
    switchTab('movies');
}

// Configurar todos los event listeners
function setupEventListeners() {
    // Navegación entre pestañas
    document.getElementById('moviesTab').addEventListener('click', () => switchTab('movies'));
    document.getElementById('usersTab').addEventListener('click', () => switchTab('users'));
    
    // Botón de logout
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Botón para añadir película
    document.getElementById('addMovieBtn').addEventListener('click', () => showMovieForm());
    
    // Cerrar modal
    const closeBtn = document.querySelector('.modal .close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            document.getElementById('movieModal').style.display = 'none';
        });
    }
    
    // Enviar formulario de película
    const movieForm = document.getElementById('movieForm');
    if (movieForm) {
        movieForm.addEventListener('submit', handleMovieSubmit);
    }
    
    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('movieModal');
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Cargar datos iniciales
async function loadInitialData() {
    try {
        await Promise.all([loadMovies(), loadUsers()]);
    } catch (error) {
        console.error('Error cargando datos iniciales:', error);
        showError('Error al cargar datos iniciales');
    }
}

// Cambiar entre pestañas
function switchTab(tabName) {
    // Ocultar todas las secciones
    document.querySelectorAll('.content-section, section').forEach(section => {
        section.classList.remove('active-section');
    });
    
    // Desactivar todos los botones de pestaña
    document.querySelectorAll('.tab-button, header nav button').forEach(button => {
        button.classList.remove('active');
    });
    
    // Activar la pestaña seleccionada
    document.getElementById(`${tabName}Section`).classList.add('active-section');
    document.getElementById(`${tabName}Tab`).classList.add('active');
}

// Cargar películas desde la API
async function loadMovies() {
    try {
        const response = await fetch('https://cineflix-api-zr5o.onrender.com/api/movies');
        
        if (!response.ok) {
            throw new Error('Error al cargar películas');
        }
        
        const movies = await response.json();
        renderMovies(movies);
    } catch (error) {
        console.error('Error cargando películas:', error);
        showError('Error al cargar películas');
    }
}

// Renderizar lista de películas
function renderMovies(movies) {
    const container = document.getElementById('moviesList');
    container.innerHTML = movies.map(movie => `
        <div class="movie-card" data-id="${movie._id}">
            <img src="${movie.posterUrl}" alt="${movie.title}" onerror="this.src='placeholder.jpg'">
            <h3>${movie.title}</h3>
            <div class="movie-actions">
                <button class="edit-btn" data-id="${movie._id}">Editar</button>
                <button class="delete-btn" data-id="${movie._id}">Eliminar</button>
            </div>
        </div>
    `).join('');

    // Agregar eventos a los botones
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            editMovie(e.target.dataset.id);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            deleteMovie(e.target.dataset.id);
        });
    });
}

// Cargar usuarios desde la API
async function loadUsers() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('https://cineflix-api-zr5o.onrender.com/api/admin/users', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al cargar usuarios');
        }
        
        const data = await response.json();
        
        // Asegúrate de acceder a la propiedad correcta
        const users = data.users || data.data || data; // Intenta con varias posibles propiedades
        
        if (!Array.isArray(users)) {
            throw new Error('Formato de datos inválido: se esperaba un array de usuarios');
        }
        
        renderUsers(users);
    } catch (error) {
        console.error('Error cargando usuarios:', error);
        showError(error.message || 'Error al cargar usuarios');
    }
}

// Renderizar lista de usuarios
function renderUsers(users) {
    const tbody = document.querySelector('#usersTable tbody');
    tbody.innerHTML = users.map(user => `
        <tr data-id="${user._id}">
            <td>${user.username}</td>
            <td>${user.name || '-'}</td>
            <td>${user.email || '-'}</td>
            <td>${user.role}</td>
            <td>${user.isActive ? 'Activo' : 'Inactivo'}</td>
            <td>
                <button class="toggle-status-btn" data-id="${user._id}" data-active="${user.isActive}">
                    ${user.isActive ? 'Desactivar' : 'Activar'}
                </button>
                ${user.role === 'user' ? 
                    `<button class="make-admin-btn" data-id="${user._id}">Hacer Admin</button>` : 
                    ''}
                <button class="delete-user-btn" data-id="${user._id}">Eliminar</button>
            </td>
        </tr>
    `).join('');

    // Agregar eventos a los botones
    document.querySelectorAll('.toggle-status-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            toggleUserStatus(e.target.dataset.id, e.target.dataset.active === 'true');
        });
    });
    
    document.querySelectorAll('.make-admin-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            makeUserAdmin(e.target.dataset.id);
        });
    });

    // Agregar evento para el nuevo botón de eliminar
    document.querySelectorAll('.delete-user-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            deleteUser(e.target.dataset.id);
        });
    });
}
// Eliminar usuario
async function deleteUser(userId) {
    if (!confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) return;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`https://cineflix-api-zr5o.onrender.com/api/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al eliminar usuario');
        }
        
        // Recargar la lista de usuarios
        await loadUsers();
        showSuccess('Usuario eliminado correctamente');
        
    } catch (error) {
        console.error('Error eliminando usuario:', error);
        showError(error.message || 'Error al eliminar usuario');
    }
}
// ======================================
// Funciones para manejar operaciones CRUD
// ======================================

// Variables para almacenar datos del formulario
let currentMovieId = null;

// Mostrar formulario para película
function showMovieForm(movieId = null) {
    const modal = document.getElementById('movieModal');
    const form = document.getElementById('movieForm');
    const title = document.getElementById('modalTitle');
    
    // Resetear el ID actual
    currentMovieId = movieId;
    
    if (movieId) {
        // Modo edición
        title.textContent = 'Editar Película';
        // La carga de datos se hace en la función editMovie
    } else {
        // Modo creación
        title.textContent = 'Añadir Nueva Película';
        form.reset();
    }
    
    modal.style.display = 'block';
}
async function createMovie(movieData, token) {
    try {
        const response = await fetch('https://cineflix-api-zr5o.onrender.com/api/movies', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(movieData)
        });

        // Verificar si la respuesta es JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Respuesta no JSON:', text);
            throw new Error('El servidor respondió con un formato inesperado');
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error en createMovie:', error);
        throw error;
    }
}

// Actualizar película existente
async function updateMovie(movieId, movieData, token) {
    const response = await fetch(`https://cineflix-api-zr5o.onrender.com/api/movies/${movieId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(movieData)
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar película');
    }
    
    return await response.json();
}
async function handleMovieSubmit(e) {
    e.preventDefault();
    
    // Obtener valores del formulario
    const title = document.getElementById('movieTitle').value;
    const description = document.getElementById('movieDescription').value || '';
    const director = document.getElementById('movieDirector')?.value || '';
    const year = document.getElementById('movieYear')?.value || '';
    const genre = document.getElementById('movieGenre')?.value.split(',') || []; // Convertir a array
    const posterUrl = document.getElementById('moviePoster')?.value || '';
    const trailerUrl = document.getElementById('movieTrailer')?.value || '';

    // Validar campos requeridos
    if (!title || !description || genre.length === 0 || !posterUrl) {
        showError('Por favor complete todos los campos requeridos');
        return;
    }

    const movieData = {
        title,
        description,
        director,
        year: parseInt(year) || null,
        genre: genre.map(g => g.trim()), // Limpiar espacios
        posterUrl,
        trailerUrl: trailerUrl || undefined
    };
    
    try {
        const token = localStorage.getItem('token');
        
        if (currentMovieId) {
            // Actualizar película existente
            await updateMovie(currentMovieId, movieData, token);
        } else {
            // Crear nueva película
            await createMovie(movieData, token);
        }
        
        // Cerrar modal y recargar lista
        document.getElementById('movieModal').style.display = 'none';
        await loadMovies();
        
    } catch (error) {
        console.error('Error al guardar película:', error);
        showError(error.message || 'No se pudo guardar la película');
    }
}
// Editar película
async function editMovie(movieId) {
    try {
        const response = await fetch(`https://cineflix-api-zr5o.onrender.com/api/movies/${movieId}`);
        
        if (!response.ok) {
            throw new Error('Error al cargar película');
        }
        
        const movie = await response.json();
        
        // Mostrar formulario
        showMovieForm(movieId);
        
        // Llenar el formulario con los datos
        document.getElementById('movieTitle').value = movie.title || '';
        
        // Verificar si los elementos existen antes de asignar valores
        if (document.getElementById('movieDirector')) {
            document.getElementById('movieDirector').value = movie.director || '';
        }
        if (document.getElementById('movieYear')) {
            document.getElementById('movieYear').value = movie.year || '';
        }
        if (document.getElementById('movieGenre')) {
            document.getElementById('movieGenre').value = movie.genre || '';
        }
        if (document.getElementById('movieSynopsis')) {
            document.getElementById('movieSynopsis').value = movie.synopsis || '';
        }
        if (document.getElementById('moviePoster')) {
            document.getElementById('moviePoster').value = movie.posterUrl || '';
        }
        
    } catch (error) {
        console.error('Error editando película:', error);
        showError('Error al cargar película para editar');
    }
}

// Eliminar película
async function deleteMovie(movieId) {
    if (!confirm('¿Estás seguro de eliminar esta película?')) return;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`https://cineflix-api-zr5o.onrender.com/api/movies/${movieId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al eliminar película');
        }
        
        // Recargar la lista
        await loadMovies();
        showSuccess('Película eliminada correctamente');
        
    } catch (error) {
        console.error('Error eliminando película:', error);
        showError('Error al eliminar película');
    }
}

// Cambiar estado de usuario
async function toggleUserStatus(userId, isCurrentlyActive) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`https://cineflix-api-zr5o.onrender.com/api/admin/users/${userId}/status`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                isActive: !isCurrentlyActive
            })
        });
        
        if (!response.ok) {
            throw new Error('Error al cambiar estado');
        }
        
        // Recargar la lista
        await loadUsers();
        showSuccess(`Usuario ${isCurrentlyActive ? 'desactivado' : 'activado'} correctamente`);
        
    } catch (error) {
        console.error('Error cambiando estado de usuario:', error);
        showError('Error al cambiar estado de usuario');
    }
}

// Convertir usuario en admin
async function makeUserAdmin(userId) {
    if (!confirm('¿Estás seguro de hacer admin a este usuario?')) return;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`https://cineflix-api-zr5o.onrender.com/api/admin/users/${userId}/role`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                role: 'admin'
            })
        });
        
        if (!response.ok) {
            throw new Error('Error al cambiar rol');
        }
        
        // Recargar la lista
        await loadUsers();
        showSuccess('Usuario convertido en admin correctamente');
        
    } catch (error) {
        console.error('Error haciendo admin al usuario:', error);
        showError('Error al cambiar rol de usuario');
    }
}

// Cerrar sesión
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// ======================================
// Funciones auxiliares
// ======================================

// Mostrar mensaje de error
function showError(message) {
    const errorElement = document.getElementById('error-message') || createMessageElement('error');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 5000);
}

// Mostrar mensaje de éxito
function showSuccess(message) {
    const successElement = document.getElementById('success-message') || createMessageElement('success');
    successElement.textContent = message;
    successElement.style.display = 'block';
    setTimeout(() => {
        successElement.style.display = 'none';
    }, 3000);
}

// Crear elemento de mensaje si no existe
function createMessageElement(type) {
    const element = document.createElement('div');
    element.id = `${type}-message`;
    element.className = `${type}-message`;
    element.style.display = 'none';
    element.style.padding = '10px';
    element.style.margin = '10px 0';
    element.style.borderRadius = '4px';
    
    if (type === 'error') {
        element.style.backgroundColor = '#f8d7da';
        element.style.color = '#721c24';
    } else {
        element.style.backgroundColor = '#d4edda';
        element.style.color = '#155724';
    }
    
    document.body.prepend(element);
    return element;
}