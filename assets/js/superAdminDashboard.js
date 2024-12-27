const token = getSessionToken()
// Function to fetch data from the API and populate the table
// Fetch data when the page loads
fetchOwnersData();
async function fetchOwnersData() {
    const url = API_URLS.getOrgOwnerList;
    const requestBody = {
        dummy: null
    };
    const response = await fetch(url, {
        method: 'POST', // Using POST method
        headers: {
            'Authorization': `Bearer ${token}`, // Replace with your actual token
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });

    const data = await response.json(); // Parse the JSON response

    // Update the owner stats (assuming data is an array)
    document.getElementById('active-owners').textContent = data.length;

    // Populate the table
    const tableBody = document.querySelector('#owners-table tbody');
    tableBody.innerHTML = ''; // Clear the existing table data

    // Iterate through each owner object in the response data
    data.forEach(owner => {
        const row = document.createElement('tr');
        row.classList.add('text-sm', 'text-gray-700');
        row.innerHTML = `
            <td class="px-6 py-3">${owner.user_name}</td>
            <td class="px-6 py-3">${owner.user_email}</td>
            <td class="px-6 py-3">${owner.user_mobile_1}</td>
            <td class="px-6 py-3">${owner.user_address}</td>
            <td class="px-6 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</td>
            <td class="px-6 py-3 text-right">
                <button class="edit-btn px-4 py-2 bg-blue-600 text-white rounded-lg" data-id="${owner.user_id}">Edit</button>
                <button class="delete-btn px-4 py-2 bg-red-600 text-white rounded-lg" data-id="${owner.user_id}">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Use event delegation to handle "Edit" and "Delete" button clicks
document.querySelector('#owners-table tbody').addEventListener('click', (e) => {
    // Check if the clicked element has a data-id attribute and the correct class
    if (e.target && e.target.classList.contains('edit-btn')) {
        const userId = e.target.getAttribute('data-id');
        if (userId) {
            window.alert(`Edit user id: ${userId}`);
        }
        else {
            console.error('userId is undefined');
        }
    }

    if (e.target && e.target.classList.contains('delete-btn')) {
        const userId = e.target.getAttribute('data-id');
        if (userId) {
            window.alert(`Delete user id: ${userId}`);
        } else {
            console.error('userId is undefined');
        }
    }
});
// Show the modal when the "Add New Owner" button is clicked
document.querySelector('.bg-indigo-600').addEventListener('click', () => {
    document.getElementById('add-owner-modal').classList.remove('hidden');
});

// Close the modal when the "Cancel" button is clicked
document.getElementById('close-modal-btn').addEventListener('click', () => {
    document.getElementById('add-owner-modal').classList.add('hidden');
});

// Submit the form to add a new owner
document.getElementById('add-owner-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Gather form data
    const ownerData = {
        userEmail: document.getElementById('owner-email').value,
        password: document.getElementById('owner-password').value, // Example password, adjust as needed
        userRole: "Owner",
        userName: document.getElementById('owner-name').value,
        userMobile1: document.getElementById('owner-mobile1').value,
        userMobile2: document.getElementById('owner-mobile2') ? document.getElementById('owner-mobile2').value : "", // Optional field
        userGender: document.getElementById('owner-gender').value, // Default gender, adjust as needed
        userAddress: document.getElementById('owner-address').value
    };

    // Make the API request
    const response = await fetch(API_URLS.createUser, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,  // Replace with actual Auth token
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(ownerData)
    });

    const result = await response.json();

    if (response.ok && result.status === 'success') {
        // Hide the modal after successful creation
        document.getElementById('add-owner-modal').classList.add('hidden');

        // Optionally, refresh the owner list or dashboard
        fetchOwnersData(); // Call your function to update the dashboard with new owner details

        // Optional: Provide feedback to the user
        alert(result.message); // User feedback (success message)
    } else {
        // Handle errors
        alert('Error: ' + (result.message || 'Failed to add owner'));
    }
});
function getSessionToken() {
    const name = "sessionToken=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookies = decodedCookie.split(';');

    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        if (cookie.indexOf(name) === 0) {
            return cookie.substring(name.length, cookie.length);
        }
    }
    return null;
}



