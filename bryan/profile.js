document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const editBtn = document.getElementById('editProfileBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const saveBtn = document.getElementById('saveBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const avatarBtn = document.querySelector('.avatar-btn');
    const userAvatar = document.getElementById('userAvatar');
    
    // Campos del formulario
    const fields = {
        name: document.getElementById('name'),
        email: document.getElementById('email'),
        currentPassword: document.getElementById('currentPassword'),
        newPassword: document.getElementById('newPassword'),
        confirmPassword: document.getElementById('confirmPassword')
    };

    // Obtener token de localStorage
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Valores originales para restaurar si se cancela
    let originalValues = {};

    // Habilitar edición
    editBtn.addEventListener('click', function() {
        Object.values(fields).forEach(field => {
            field.disabled = false;
            field.classList.add('editable');
        });
        cancelBtn.disabled = false;
        saveBtn.disabled = false;
        editBtn.disabled = true;
    });

    // Cancelar edición
    cancelBtn.addEventListener('click', function() {
        fields.name.value = originalValues.name || '';
        fields.email.value = originalValues.email || '';
        fields.currentPassword.value = '';
        fields.newPassword.value = '';
        fields.confirmPassword.value = '';
        
        Object.values(fields).forEach(field => {
            field.disabled = true;
            field.classList.remove('editable');
        });
        cancelBtn.disabled = true;
        saveBtn.disabled = true;
        editBtn.disabled = false;
    });

    // Cambiar foto de perfil
    avatarBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const newInitial = prompt('Ingresa una nueva inicial para tu avatar (1 carácter)');
        if (newInitial && newInitial.length === 1) {
            userAvatar.textContent = newInitial.toUpperCase();
        }
    });

    // Cerrar sesión
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    });

    // Guardar cambios
    saveBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        
        // Validación
        if (fields.newPassword.value !== fields.confirmPassword.value) {
            alert('Las nuevas contraseñas no coinciden');
            return;
        }

        // Mostrar carga
        saveBtn.disabled = true;
        saveBtn.textContent = 'Guardando...';

        try {
            // Preparar datos para enviar
            const updateData = {
                name: fields.name.value,
                email: fields.email.value
            };

            // Solo enviar contraseña si se está cambiando
            if (fields.currentPassword.value && fields.newPassword.value) {
                updateData.currentPassword = fields.currentPassword.value;
                updateData.newPassword = fields.newPassword.value;
            }

            // Enviar al backend
            const response = await fetch('http://localhost:5000/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al actualizar el perfil');
            }

            // Actualizar valores originales
            originalValues.name = fields.name.value;
            originalValues.email = fields.email.value;
            
            // Limpiar y deshabilitar campos
            fields.currentPassword.value = '';
            fields.newPassword.value = '';
            fields.confirmPassword.value = '';
            
            Object.values(fields).forEach(field => {
                field.disabled = true;
                field.classList.remove('editable');
            });
            
            cancelBtn.disabled = true;
            saveBtn.disabled = true;
            editBtn.disabled = false;
            saveBtn.textContent = 'Guardar cambios';
            
            alert('Perfil actualizado correctamente');
        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
            saveBtn.disabled = false;
            saveBtn.textContent = 'Guardar cambios';
        }
    });

    // Cargar datos del usuario
    async function loadUserData() {
    try {
        const response = await fetch('http://localhost:5000/api/users/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al cargar datos del usuario');
        }
        
        const userData = await response.json();
        
        // Mostrar datos en el formulario
        fields.name.value = userData.name || '';
        fields.email.value = userData.email || userData.username || '';
        
        // Guardar valores originales
        originalValues.name = userData.name || '';
        originalValues.email = userData.email || userData.username || '';
        
        // Mostrar inicial del avatar (prioridad: name > username)
        const displayName = userData.name || userData.username || '';
        if (displayName) {
            userAvatar.textContent = displayName.charAt(0).toUpperCase();
        }
    } catch (error) {
        console.error('Error cargando datos del usuario:', error);
        alert('Error al cargar datos del usuario');
    }
}

    // Inicializar
    loadUserData();
});