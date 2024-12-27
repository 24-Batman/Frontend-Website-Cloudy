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
    const url = API_URLS.getSiteList;
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

    document.getElementById('active-sites').textContent = data.sites.length;
    document.getElementById('org-name-lable').textContent = `Organization: ${data.orgName}`;

    // Populate the table
    const tableBody = document.querySelector('#site-table tbody');
    tableBody.innerHTML = ''; // Clear the existing table data
    globalOrgId = data.orgId;
    data.sites.forEach(site => {
        if (site.siteId != null) {
            const row = document.createElement('tr');
            row.classList.add('text-sm', 'text-gray-700');
            row.innerHTML = `
            <td class="px-6 py-3">${site.siteName}</td>
            <td class="px-6 py-3">${site.siteAddress}</td>
            <td class="px-6 py-3">${site.siteAdminName ? site.siteAdminName : `<button class="add-admin-btn px-4 py-2 bg-blue-600 text-white rounded-lg" data-id="${site.siteId}">Add Admin</button>`}</td>
            <td class="px-6 py-3 text-right">
                <button class="edit-btn px-4 py-2 bg-blue-600 text-white rounded-lg" data-id="${site.siteId}">Edit</button>
                <button class="delete-btn px-4 py-2 bg-red-600 text-white rounded-lg" data-id="${site.siteId}">Delete</button>
            </td>
        `;
            tableBody.appendChild(row);
        }
        else {
            document.getElementById('active-sites').textContent = 0;
        }
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

//open add site modal to add site
document.querySelector('.bg-indigo-600').addEventListener('click', () => {
    document.getElementById('add-site-modal').classList.remove('hidden');
});
// Close the modal when the "Cancel" button is clicked
document.getElementById('close-site-modal-btn').addEventListener('click', () => {
    document.getElementById('add-site-modal').classList.add('hidden');
});
//create site when the form is submited
document.getElementById('add-site-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Gather form data
    const siteData = {
        siteName: document.getElementById('site-name').value,
        siteAddress: document.getElementById('site-address').value,
        orgId: globalOrgId
    };
    // Make the API request
    const response = await fetch(API_URLS.createSite, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,  // Replace with actual Auth token
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(siteData)
    });

    const result = await response.json();

    if (response.ok && result.status === 'success') {
        // Hide the modal after successful creation
        document.getElementById('add-site-modal').classList.add('hidden');

        fetchSitesData();

        // Optional: Provide feedback to the user
        alert(result.message); // User feedback (success message)
    } else {
        // Handle errors
        alert('Error: ' + (result.message || 'Failed to add site'));
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