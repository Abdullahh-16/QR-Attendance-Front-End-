document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const usernameInput = document.getElementById('username').value;
            const passwordInput = document.getElementById('password').value;

            try {
                const formData = new URLSearchParams();
                formData.append('username', usernameInput);
                formData.append('password', passwordInput);

                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: formData.toString()
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.detail || 'Login failed');
                }

                const data = await response.json();
                localStorage.setItem('access_token', data.access_token);
                window.location.href = 'dashboard.html';
            } catch (error) {
                alert(`Login Error: ${error.message}`);
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fullName = document.getElementById('fullName').value;
            const usernameInput = document.getElementById('username').value;
            const passwordInput = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (passwordInput !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        full_name: fullName,
                        username: usernameInput,
                        password: passwordInput,
                        confirm_password: confirmPassword
                    })
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.detail || 'Registration failed');
                }

                alert('Registration successful! Please login.');
                window.location.href = 'login.html';
            } catch (error) {
                alert(`Registration Error: ${error.message}`);
            }
        });
    }
});
