document.getElementById('signup-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;

    try {
        const response = await fetch('https://expense-tracker-2-0-6xlq.onrender.com/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: username, password })
        });

        if (response.ok) {
            alert('Signup successful! You can now log in.');
            window.location.href = 'login.html'; // Redirect to login page
        } else {
            const { error } = await response.json();
            alert(error);
        }
    } catch (error) {
        console.error('Error signing up:', error);
        alert('An error occurred while signing up.');
    }
});
