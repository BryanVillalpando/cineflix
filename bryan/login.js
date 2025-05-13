document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorElement = document.getElementById('errorMessage');
    
    // Resetear mensajes de error
    errorElement.textContent = '';
    usernameInput.classList.remove('input-error');
    passwordInput.classList.remove('input-error');
    
    // Mostrar carga
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Iniciando...';
    
    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                username: usernameInput.value,
                password: passwordInput.value 
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            // Mostrar error específico
            errorElement.textContent = data.message || 'Credenciales incorrectas';
            
            // Resaltar campos con error
            if (data.errorCode === 'USER_NOT_FOUND') {
                usernameInput.classList.add('input-error');
            } else if (data.errorCode === 'INVALID_PASSWORD') {
                passwordInput.classList.add('input-error');
            }
            
            return;
        }
        
        // Guardar token y redirigir
        // Guardar token y redirigir
localStorage.setItem('token', data.token);
localStorage.setItem('user', JSON.stringify(data.user));

// Redirección basada en el rol
if (data.user && data.user.role === 'admin') {
    window.location.href = 'admin.html';
} else {
    window.location.href = 'inicio.html';
}


        
    } catch (error) {
        console.error('Error:', error);
        errorElement.textContent = 'Error de conexión. Intenta nuevamente.';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Iniciar Sesión';
    }
});