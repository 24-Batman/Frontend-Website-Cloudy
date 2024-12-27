const token = getSessionToken();
let adminAddPcId = null;
let globalSiteId = null;

// Initialize page
fetchPcData();
const overlay = document.getElementById('overlay');
const sidebarToggle = document.querySelector('[data-drawer-toggle="logo-sidebar"]');
const sidebar = document.getElementById('logo-sidebar');

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
overlay.addEventListener('click', () => {
    sidebar.classList.add('-translate-x-full');
    overlay.classList.add('hidden');
});

async function fetchPcData() {
    try {
        const response = await fetch(API_URLS.getPcList, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ dummy: null })
        });

        const data = await response.json();

        // Update dashboard elements
        document.getElementById('active-pc').textContent = data.pcList.length;
        document.getElementById('org-name-lable').textContent = `Organization: ${data.orgName}`;
        document.getElementById('site-name-lable').textContent = `site: ${data.siteName}`;

        // Update table
        const tableBody = document.querySelector('#pc-table tbody');
        tableBody.innerHTML = '';
        globalSiteId = data.siteId;

        data.pcList.forEach(pc => {
            if (pc.pcId != null) {
                const row = document.createElement('tr');
                row.classList.add('text-sm', 'text-gray-700');
                row.innerHTML = `
                    <td class="px-6 py-3">${pc.pcName}</td>
                    <td class="px-6 py-3">${pc.macAddress}</td>
                    <td class="px-6 py-3">${pc.pcAdminId ? pc.pcAdminName : `<button class="add-admin-btn px-4 py-2 bg-blue-600 text-white rounded-lg" data-id="${pc.pcId}">Add Admin</button>`}</td>
                    <td class="px-6 py-3">${pc.isApproved === 1 ? `<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Approved</span>` : `<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Approval Pending</span>`}</td>
                    <td class="px-6 py-3 text-right">
                        <button class="edit-btn px-4 py-2 bg-blue-600 text-white rounded-lg" data-id="${pc.pcId}">Edit</button>
                        <button class="delete-btn px-4 py-2 bg-red-600 text-white rounded-lg" data-id="${pc.pcId}">Delete</button>
                    </td>
                `;
                tableBody.appendChild(row);
            } else {
                document.getElementById('active-pc').textContent = 0;
            }
        });
    } catch (error) {
        console.error('Error fetching PC data:', error);
    }
}

// Table action handlers
document.querySelector('#pc-table tbody').addEventListener('click', (e) => {
    const pcId = e.target.getAttribute('data-id');

    if (e.target.classList.contains('edit-btn') && pcId) {
        window.alert(`Edit pc id: ${pcId}`);
    }

    if (e.target.classList.contains('delete-btn') && pcId) {
        window.alert(`Delete pc id: ${pcId}`);
    }

    if (e.target.classList.contains('add-admin-btn') && pcId) {
        document.getElementById('add-admin-modal').classList.remove('hidden');
        adminAddPcId = pcId;
    }
});

// Modal handlers
document.getElementById('close-admin-modal-btn').addEventListener('click', () => {
    document.getElementById('add-admin-modal').classList.add('hidden');
    adminAddPcId = null;
});

document.querySelector('.bg-indigo-600').addEventListener('click', () => {
    document.getElementById('add-pc-modal').classList.remove('hidden');
});

document.getElementById('close-pc-modal-btn').addEventListener('click', () => {
    document.getElementById('add-pc-modal').classList.add('hidden');
});

// Form submissions
document.getElementById('add-pc-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const pcData = {
        pcName: document.getElementById('pc-name').value,
        pcAddress: document.getElementById('pc-address').value,
        siteId: globalSiteId
    };

    try {
        const response = await fetch(API_URLS.assignPcToSite, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pcData)
        });

        const result = await response.json();

        if (response.ok) {
            document.getElementById('add-pc-modal').classList.add('hidden');
            fetchPcData();
            alert(result.message);
        } else {
            alert('Error: ' + (result.message || 'Failed to add pc'));
        }
    } catch (error) {
        console.error('Error adding PC:', error);
    }
});

document.getElementById('add-admin-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const adminData = {
        pcId: adminAddPcId,
        userEmail: document.getElementById('admin-email').value,
        password: document.getElementById('admin-password').value,
        userRole: "PC Admin",
        userName: document.getElementById('admin-name').value,
        userMobile1: document.getElementById('admin-mobile1').value,
        userMobile2: document.getElementById('admin-mobile2').value || "",
        userGender: document.getElementById('admin-gender').value,
        userAddress: document.getElementById('admin-address').value
    };

    try {
        const response = await fetch(API_URLS.assignPcAdmin, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(adminData)
        });

        const result = await response.json();

        if (response.ok && result.status === 'success') {
            document.getElementById('add-admin-modal').classList.add('hidden');
            fetchPcData();
            alert(result.message);
        } else {
            alert('Error: ' + (result.message || 'Failed to add admin'));
        }
    } catch (error) {
        console.error('Error adding admin:', error);
    }
});
// Show modal
document.getElementById('add-admin-button').addEventListener('click', () => {
    document.getElementById('add-admin-modal').classList.remove('hidden');
});

// Hide modal
document.getElementById('close-admin-modal-btn').addEventListener('click', () => {
    document.getElementById('add-admin-modal').classList.add('hidden');
    document.getElementById('add-admin-form').reset();
});

// Form submission
let currentPcId = null;

function showAddAdminModal(pcId) {
    currentPcId = pcId;
    document.getElementById('add-admin-modal').classList.remove('hidden');
}

function closeAddAdminModal() {
    document.getElementById('add-admin-modal').classList.add('hidden');
    document.getElementById('add-admin-form').reset();
    currentPcId = null;
}

function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    input.type = input.type === 'password' ? 'text' : 'password';
}

document.getElementById('add-admin-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!currentPcId) {
        showNotification('No PC selected', 'error');
        return;
    }

    const formData = {
        pcId: currentPcId,
        userEmail: document.getElementById('admin-email').value,
        password: document.getElementById('admin-password').value,
        userRole: "PC Admin",
        userName: document.getElementById('admin-name').value,
        userMobile1: document.getElementById('admin-mobile1').value,
        userMobile2: document.getElementById('admin-mobile2').value || "",
        userGender: document.getElementById('admin-gender').value,
        userAddress: document.getElementById('admin-address').value
    };

    try {
        const response = await fetch(API_URLS.assignPcAdmin, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            showNotification('Admin added successfully', 'success');
            closeAddAdminModal();
            // Refresh your PC data or table here
            fetchPcData();
        } else {
            showNotification(data.message || 'Failed to add admin', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('An error occurred while adding admin', 'error');
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const sidebarToggle = document.querySelector("[data-drawer-toggle='logo-sidebar']");
    const sidebar = document.getElementById("logo-sidebar");
    const mainContent = document.getElementById("main-content"); // or whatever the main container is

    // Toggle when the menu button is clicked
    sidebarToggle.addEventListener("click", () => {
        sidebar.classList.toggle("-translate-x-full");
    });

    // Handle window resize
    function handleResize() {
        if (window.innerWidth >= 768) {
            sidebar.classList.remove("-translate-x-full");
            sidebar.classList.add("translate-x-0");
            mainContent.classList.remove("ml-20");
            mainContent.classList.add("ml-64");
        } else {
            sidebar.classList.remove("translate-x-0");
            sidebar.classList.add("-translate-x-full");
            mainContent.classList.remove("ml-64");
            mainContent.classList.add("ml-20");
        }
    }
    window.addEventListener("resize", handleResize);
    handleResize();

    // Optional: Close sidebar when clicking outside
    document.addEventListener("click", (event) => {
        if (
            !sidebar.contains(event.target) &&
            !sidebarToggle.contains(event.target) &&
            !sidebar.classList.contains("-translate-x-full")
        ) {
            sidebar.classList.add("-translate-x-full");
        }
    });
});
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg ${type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white z-50`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}


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
function showNotification(message, type) {
    const notificationDiv = document.createElement('div');
    notificationDiv.className = `fixed top-4 right-4 p-4 rounded-lg ${type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`;
    notificationDiv.textContent = message;
    document.body.appendChild(notificationDiv);

    setTimeout(() => {
        notificationDiv.remove();
    }, 3000);
}

function showAddAdminModal() {
    const modal = document.getElementById('add-admin-modal');
    modal.classList.remove('hidden');
}

// Hide the Add Admin Modal
function hideAddAdminModal() {
    const modal = document.getElementById('add-admin-modal');
    modal.classList.add('hidden');
}


// Select the element using its selector
const element = document.querySelector('button.inline-flex.items-center.p-2.text-sm.text-gray-500.rounded-lg.sm\\:hidden.hover\\:bg-gray-100.focus\\:outline-none.focus\\:ring-2.focus\\:ring-gray-200');

// Define the event listener function
function handleClick() {
    console.log('Element clicked!');
    // Add your desired logic here
}

// Attach the event listener for the 'click' event
element.addEventListener('click', handleClick);

// Log a message to confirm the event listener is attached
console.log('Event listener attached to element:', element);

