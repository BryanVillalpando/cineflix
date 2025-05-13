document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const username = document.getElementById('username').value;
    const name = document.getElementById('name').value; // Nuevo campo
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
  
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, name, password, email }) // Incluye name
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert('Registro exitoso');
        window.location.href = 'login.html';
      } else {
        alert('Error: ' + (data.message || 'No se pudo registrar'));
      }
    } catch (error) {
      alert('Error en el servidor');
      console.error(error);
    }
});