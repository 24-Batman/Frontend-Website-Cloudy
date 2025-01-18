const token = getSessionToken();
// Fetch data when the page loads
fetchSitesData();

var adminAddSiteId = null;
var globalOrgId = null;

// Add this at the end of your body, just before the closing </body> tag

// Initialize sidebar toggle functionality
const sidebarToggle = document.querySelector('[data-drawer-toggle="logo-sidebar"]');
const sidebar = document.getElementById('logo-sidebar');
const overlay = document.getElementById('overlay');

sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('-translate-x-full');
    overlay.classList.toggle('hidden');

});

// Optional: Close sidebar when clicking outside
document.addEventListener('click', (event) => {
    if (!sidebar.contains(event.target) &&
        !sidebarToggle.contains(event.target) &&
        !sidebar.classList.contains('-translate-x-full')) {
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
    }
});
async function fetchSitesData() {
    const url = 'https://mdasriyashtttptrigger.azurewebsites.net/api/GetSiteList?';
    const response = await fetch(url, {
        method: 'POST', // Using POST method
        headers: {
            'Authorization': `Bearer ${token}`, // Ensure this token is valid
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({}) // No need for a request body if not required
    });

    const data = await response.json(); // Parse the JSON response

    // Update the UI with fetched data
    document.getElementById('active-sites').textContent = data.sites.length;
    document.getElementById('org-name-label').textContent = `Organization: ${data.orgName}`;

    // Populate the table with fetched data
    const tableBody = document.querySelector('#site-table tbody');
    tableBody.innerHTML = ''; // Clear the existing table data
    globalOrgId = data.orgId;

    const colors = ['red', 'green', 'blue']; // Define the color pattern

    data.sites.forEach((site, index) => {
        const color = colors[index % colors.length]; // Cycle through colors
        const row = document.createElement('tr');
        row.classList.add('hover:bg-gray-50', 'transition-colors');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10 bg-${color}-100 rounded-lg flex items-center justify-center">
                        <svg class="h-6 w-6 text-${color}-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">${site.siteName}</div>
                        <div class="text-sm text-gray-500">ID: SITE00${site.siteId}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${site.siteAddress}</div>
                <div class="text-sm text-gray-500">Location details</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                ${site.siteAdminName ? `
                <div class="flex items-center">
                    <div class="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <span class="text-sm font-medium text-gray-600">${site.siteAdminName.charAt(0)}</span>
                    </div>
                    <div class="ml-3">
                        <div class="text-sm font-medium text-gray-900">${site.siteAdminName}</div>
                        <div class="text-sm text-gray-500">admin@example.com</div>
                    </div>
                </div>` : `
                <button class="add-admin-btn px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2" data-id="${site.siteId}">
                    <svg class="w-5 h-5 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span class="hidden md:inline">Add Admin</span>
                </button>`}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                <div class="flex space-x-3">
                    <button class="edit-btn text-indigo-600 hover:text-indigo-900 transition-colors" data-id="${site.siteId}">
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                    <button class="delete-btn text-red-600 hover:text-red-900 transition-colors" data-id="${site.siteId}">
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Use event delegation to handle "Edit" and "Delete" button clicks
document.querySelector('#site-table tbody').addEventListener('click', (e) => {
    // Check if the clicked element has a data-id attribute and the correct class
    if (e.target && e.target.classList.contains('edit-btn')) {
        const siteId = e.target.getAttribute('data-id');
        if (siteId) {
            window.alert(`Edit site id: ${siteId}`);
        }
        else {
            console.error('siteId is undefined');
        }
    }

    if (e.target && e.target.classList.contains('delete-btn')) {
        const siteId = e.target.getAttribute('data-id');
        if (siteId) {
            window.alert(`Delete site id: ${siteId}`);
        } else {
            console.error('siteId is undefined');
        }
    }
    if (e.target && e.target.classList.contains('add-admin-btn')) {
        const siteId = e.target.getAttribute('data-id');
        if (siteId) {
            document.getElementById('add-admin-modal').classList.remove('hidden');
            adminAddSiteId = siteId;
        } else {
            console.error('siteId is undefined');
        }
    }
});

// Close the modal when the "Cancel" button is clicked
document.getElementById('close-site-modal-btn').addEventListener('click', () => {
    document.getElementById('add-admin-modal').classList.add('hidden');
    adminAddSiteId = null;
});

// Function to open the Add Site modal
document.querySelector('.bg-indigo-600').addEventListener('click', () => {
    document.getElementById('add-site-modal').classList.remove('hidden');
});

// Close the modal when the "Cancel" button is clicked
document.getElementById('close-site-modal-btn').addEventListener('click', () => {
    document.getElementById('add-site-modal').classList.add('hidden');
});

// Create site when the form is submitted
document.getElementById('add-site-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Gather form data
    const siteData = {
        siteName: document.getElementById('site-name').value,
        siteAddress: document.getElementById('site-address').value,
        orgId: globalOrgId
    };

    try {
        // Make the API request
        const response = await fetch('https://mdasriyashtttptrigger.azurewebsites.net/api/CreateSite?', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,  // Ensure this token is valid
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(siteData)
        });

        const result = await response.json();

        if (response.ok && result.status === 'success') {
            // Hide the modal after successful creation
            document.getElementById('add-site-modal').classList.add('hidden');

            // Refresh the site list
            fetchSitesData();

            // Provide feedback to the user
            alert(result.message || 'Site created successfully');
        } else {
            // Handle errors
            alert('Error: ' + (result.message || 'Failed to add site'));
        }
    } catch (error) {
        console.error('Error creating site:', error);
        alert('Error: Failed to create site');
    }
});

// Submit the form to add a new admin
document.getElementById('add-admin-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    // Gather form data
    const adminData = {
        siteId: adminAddSiteId,
        userEmail: document.getElementById('admin-email').value,
        password: document.getElementById('admin-password').value, // Example password, adjust as needed
        userRole: "Site Admin",
        userName: document.getElementById('admin-name').value,
        userMobile1: document.getElementById('admin-mobile1').value,
        userMobile2: document.getElementById('admin-mobile2') ? document.getElementById('admin-mobile2').value : "", // Optional field
        userGender: document.getElementById('admin-gender').value, // Default gender, adjust as needed
        userAddress: document.getElementById('admin-address').value
    };

    // Make the API request
    const response = await fetch(API_URLS.assignSiteAdmin, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,  // Replace with actual Auth token
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(adminData)
    });

    const result = await response.json();

    if (response.ok && result.status === 'success') {
        // Hide the modal after successful creation
        document.getElementById('add-admin-modal').classList.add('hidden');

        // Optionally, refresh the admin list or dashboard
        fetchSitesData(); // Call your function to update the dashboard with new admin details

        // Optional: Provide feedback to the user
        alert(result.message); // User feedback (success message)
    } else {
        // Handle errors
        alert('Error: ' + (result.message || 'Failed to add admin'));
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

// Add Admin Modal Functionality
document.querySelectorAll('[id^="add-admin-btn"]').forEach(button => {
    button.addEventListener('click', function() {
        document.getElementById('add-admin-modal').classList.remove('hidden');
    });
});

document.getElementById('close-admin-modal-btn').addEventListener('click', function() {
    document.getElementById('add-admin-modal').classList.add('hidden');
});

// Close modal when clicking outside
document.getElementById('add-admin-modal').addEventListener('click', function(e) {
    if (e.target === this) {
        this.classList.add('hidden');
    }
});

// Prevent form submission from closing modal unless valid
document.getElementById('add-admin-form').addEventListener('submit', function(e) {
    e.preventDefault();
    // Add your form submission logic here
    
    // Temporarily hide modal after submission
    document.getElementById('add-admin-modal').classList.add('hidden');
});