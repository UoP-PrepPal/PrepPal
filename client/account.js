const accountInfoContainer = document.querySelector('#account-info');


window.addEventListener('DOMContentLoaded', () => {
    fetch('/account')  // Make a GET request to fetch account info
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch account info');
            }
            return response.json(); // Parse the response data
        })
        .then(data => {
            // Display only the username and email in the container
            accountInfoContainer.innerHTML = `
                <p><strong>Username:</strong> ${data.username}</p>
                <p><strong>Email:</strong> ${data.email}</p>
            `;
        })
        .catch(error => {
            console.error('Error fetching account info:', error);
            alert('An error occurred while fetching account info.');
        });
});