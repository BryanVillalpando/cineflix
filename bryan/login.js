document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorElement = document.getElementById('errorMessage');
    
    errorElement.textContent = '';
    usernameInput.classList.remove('input-error');
    passwordInput.classList.remove('input-error');
    

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Iniciando...';
    
    try {
        const response = await fetch('https://cineflix-api-zr5o.onrender.com/api/auth/login', {
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
            errorElement.textContent = data.message || 'Credenciales incorrectas';
            
            if (data.errorCode === 'USER_NOT_FOUND') {
                usernameInput.classList.add('input-error');
            } else if (data.errorCode === 'INVALID_PASSWORD') {
                passwordInput.classList.add('input-error');
            }
            
            return;
        }
        

localStorage.setItem('token', data.token);
localStorage.setItem('user', JSON.stringify(data.user));

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