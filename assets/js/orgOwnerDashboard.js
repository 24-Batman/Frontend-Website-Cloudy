// Global variables
let adminAddOrgId = null;
const token = getSessionToken();

// Toast notification system
const toastTypes = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
};

document.getElementById('sidebar-toggle').addEventListener('click', function () {
    const sidebar = document.getElementById('drawer-navigation');
    if (sidebar.classList.contains('-translate-x-full')) {
        sidebar.classList.remove('-translate-x-full');
    } else {
        sidebar.classList.add('-translate-x-full');
    }
});

// Function to get session token
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

// Toast notification function
function showToast(message, type = toastTypes.SUCCESS) {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 p-4 rounded-lg text-white ${
        type === toastTypes.SUCCESS ? 'bg-green-500' :
        type === toastTypes.ERROR ? 'bg-red-500' :
        type === toastTypes.INFO ? 'bg-blue-500' :
        type === toastTypes.WARNING ? 'bg-yellow-500' : 'bg-yellow-500'
    } transition-all duration-300 ease-in-out z-50`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Organization Data Functions
async function fetchOrganizationsData() {
    try {
        if (!token) {
            window.location.href = '/login.html';
            return;
        }

        const response = await fetch(API_URLS.getOrgList, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ "dummy": null })
        });

        const data = await response.json();
        console.log('Organizations data:', data);

        if (data.status === "success" && Array.isArray(data.organizations)) {
            updateDashboardStats(data.organizations);
            renderOrganizationsTable(data.organizations);
        } else {
            throw new Error(data.message || 'Failed to fetch organizations');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast(error.message, toastTypes.ERROR);
    }
}

// Dashboard Stats Update
function updateDashboardStats(organizations) {
    const orgsWithAdmin = organizations.filter(org => 
        org.organizationAdminName && org.organizationAdminName !== "No Admin Assigned"
    ).length;

    const orgsWithoutAdmin = organizations.filter(org => 
        !org.organizationAdminName || org.organizationAdminName === "No Admin Assigned"
    ).length;

    // Update stats in DOM
    document.getElementById('total-organizations').textContent = organizations.length;
    document.getElementById('active-sites').textContent = orgsWithAdmin;
    document.getElementById('admin-assign-count').textContent = orgsWithoutAdmin;
}

function animateLogout(callback) {
    const logoutBtn = document.querySelector('button[onclick="handleLogout()"]');
    if (!logoutBtn) return callback();

    // Store original button content
    const originalContent = logoutBtn.innerHTML;

    // Add spinner and "Logging out..." text
    logoutBtn.innerHTML = `
        <div class="flex items-center justify-center space-x-2">
            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Logging out...</span>
        </div>
    `;

    // Disable the button
    logoutBtn.disabled = true;
    
    // Add required styles dynamically
    const style = document.createElement('style');
    style.textContent = `
        .animate-spin {
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            from {
                transform: rotate(0deg);
            }
            to {
                transform: rotate(360deg);
            }
        }
    `;
    document.head.appendChild(style);

    // Wait for animation and then execute callback
    setTimeout(callback, 1000);
}

function handleLogout() {
    animateLogout(() => {
        // Clear localStorage
        localStorage.removeItem('userDetails');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userPassword');
        
        // Clear session cookie
        document.cookie = 'sessionToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        
        // Redirect to login page
        window.location.href = '/login.html';
    });
}

// Table Rendering
function renderOrganizationsTable(organizations) {
    const tableBody = document.querySelector('#organizations-table tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    organizations.forEach(org => {
        const row = document.createElement('tr');
        row.dataset.orgId = org.organizationId;
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${org.organizationId}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${org.organizationName}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${org.organizationAddress}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                ${org.organizationAdminName === "No Admin Assigned" ? 
                    `<button onclick="openAssignAdminModal('${org.organizationId}')"
                        class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700 hover:bg-indigo-200">
                        <i class='bx bx-plus mr-1'></i> Add Admin
                    </button>` : 
                    `<span class="text-gray-900">${org.organizationAdminName}</span>`
                }
            </td>
            <td class="px-4 py-4 whitespace-nowrap text-sm">
                <div class="flex items-center gap-2">
                    <button onclick="openEditOrgModal('${org.organizationId}')" 
                        class="p-1 text-indigo-600 hover:text-indigo-900">
                        <i class='bx bx-edit-alt text-xl'></i>
                    </button>
                    <button onclick="deleteOrganization('${org.organizationId}')"
                        class="p-1 text-red-600 hover:text-red-900">
                        <i class='bx bx-trash text-xl'></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function addOrganization(){
    document.getElementById('add-organization-modal').classList.remove('hidden');
}

function closeAddOrgModal(){
    const modal = document.getElementById('add-organization-modal');
    const form = document.getElementById('add-organization-form');
    
    modal.classList.add('hidden');
    form.reset();
    
    // Reset form state
    form.dataset.isEdit = 'false';
    form.dataset.orgId = '';
    
    // Reset modal title
    modal.querySelector('h2').textContent = 'Add New Organization';
}

// Modal Functions
function openAssignAdminModal(orgId) {
    adminAddOrgId = orgId;
    document.getElementById('add-admin-modal').classList.remove('hidden');
}

function closeAssignAdminModal() {
    document.getElementById('add-admin-modal').classList.add('hidden');
    document.getElementById('add-admin-form').reset();
    adminAddOrgId = null;
}

// Form Submission Handler
document.getElementById('add-admin-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    try {
        if (!adminAddOrgId) throw new Error('Organization ID not found');

        const formData = {
            "orgId": parseInt(adminAddOrgId),
            "userEmail": document.getElementById('admin-email').value,
            "password": document.getElementById('admin-password').value,
            // "userRole": "Organization Admin",
            "userName": document.getElementById('admin-name').value,
            "userMobile1": document.getElementById('admin-mobile1').value,
            "userMobile2": document.getElementById('admin-mobile2').value || "",
            "userGender": document.getElementById('admin-gender').value,
            "userAddress": document.getElementById('admin-address').value
        };

        console.log('Sending admin data:', formData);

        const response = await fetch(API_URLS.assignOrgAdmin, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        console.log('Response:', data);

        if (data.status === "success") {
            showToast('Admin assigned successfully!', toastTypes.SUCCESS);
            closeAssignAdminModal();
            fetchOrganizationsData();
        } else {
            throw new Error(data.message || 'Failed to assign admin');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast(error.message, toastTypes.ERROR);
    }
});
//create org when the form is submited
document.getElementById('add-organization-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    try {
        const form = e.target;
        const isEdit = form.dataset.isEdit === 'true';
        const orgId = form.dataset.orgId;

        const formData = {
            "orgName": document.getElementById('organization-name').value,
            "orgAddress": document.getElementById('organization-address').value,
            "regYear": document.getElementById('organization-reg-year').value,
            "gstNumber": document.getElementById('organization-gst').value || ""
        };

        // If it's an edit, add orgId to formData
        if (isEdit) {
            formData.orgId = parseInt(orgId);
        }

        const apiUrl = isEdit ? API_URLS.updateOrg : API_URLS.createOrg;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        console.log('Response:', data);

        if (data.status === "success") {
            showToast(`Organization ${isEdit ? 'updated' : 'created'} successfully!`, toastTypes.SUCCESS);
            closeAddOrgModal();
            fetchOrganizationsData(); // Refresh the table
        } else {
            throw new Error(data.message || `Failed to ${isEdit ? 'update' : 'create'} organization`);
        }
    } catch (error) {
        console.error('Error:', error);
        showToast(error.message, toastTypes.ERROR);
    }
});
// Function to render PC requests
function renderPCRequests() {
    const container = document.getElementById('notification-container');
    if (!container) return;

    container.innerHTML = ''; // Clear existing content

    if (pcRequests.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8">
                <p class="text-gray-500">No pending PC approval requests</p>
            </div>
        `;
        return;
    }

    pcRequests.forEach(request => {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow p-4 mb-4';
        card.setAttribute('data-pc-id', request.id); // Add data attribute for identification
        
        card.innerHTML = `
            <div class="flex items-start gap-4">
                <div class="flex-shrink-0">
                    <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <i class='bx bx-desktop text-indigo-600 text-xl'></i>
                    </div>
                </div>
                <div class="flex-1">
                    <div class="flex justify-between items-start">
                        <h4 class="font-medium text-gray-900">New PC Approval Request</h4>
                        <span class="text-sm text-gray-500">${request.orgName}</span>
                    </div>
                    <div class="mt-2 space-y-1 text-sm text-gray-600">
                        <p class="flex justify-between">
                            <span class="font-medium">Site:</span>
                            <span>${request.siteName}</span>
                        </p>
                        <p class="flex justify-between">
                            <span class="font-medium">PC Name:</span>
                            <span>${request.pcName}</span>
                        </p>
                        <p class="flex justify-between">
                            <span class="font-medium">Added By:</span>
                            <span>${request.addedBy} (${request.role})</span>
                        </p>
                    </div>
                    <div class="mt-4 flex gap-2">
                        <button onclick="handlePCAction('${request.id}', 'Approve')" 
                            class="flex-1 inline-flex justify-center items-center px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300">
                            <i class='bx bx-check mr-1'></i> Approve
                        </button>
                        <button onclick="handlePCAction('${request.id}', 'Reject')" 
                            class="flex-1 inline-flex justify-center items-center px-3 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-gray-200">
                            <i class='bx bx-x mr-1'></i> Reject
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(card);
    });
}

function showApprovePC() {
    const modal = document.getElementById('approve-pc-card');
    if (modal) {
        modal.classList.remove('hidden');
        renderPCRequests(); // Ensure this is called to populate the modal
        updateNotificationCount(); // Update the notification count
        console.log('Notification count updated:', pcRequests.length); // Debugging line
    }
}

function closeApprovePC() {
    const modal = document.getElementById('approve-pc-card');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Function to handle approve/reject actions
function handlePCAction(pcId, action) {
    // Find the request in the pcRequests array
    const requestIndex = pcRequests.findIndex(req => req.id === pcId);
    
    if (requestIndex !== -1) {
        // Find the notification card element
        const card = document.querySelector(`[data-pc-id="${pcId}"]`);
        if (card) {
            // Add fade-out animation
            card.style.transition = 'opacity 0.3s ease-out';
            card.style.opacity = '0';
            
            setTimeout(() => {
                // Remove the request from the array
                pcRequests.splice(requestIndex, 1);
                
                // Re-render the notifications
                renderPCRequests();
                
                // Update notification count
                updateNotificationCount();
                
                // Show appropriate toast message
                if (action === 'Approve') {
                    showToast(`PC Request ${pcId} has been approved successfully`, toastTypes.SUCCESS);
                } else if (action === 'Reject') {
                    showToast(`PC Request ${pcId} has been rejected`, toastTypes.ERROR);
                }
            }, 300);
        }
    }
}

function updateProfile(){
    const userDetails = JSON.parse(localStorage.getItem('userDetails'));
    console.log('User details:', userDetails);
    if (userDetails) {
        const profileInitials = document.getElementById('profile-initials');
        if (profileInitials) {
            profileInitials.textContent = userDetails.initials || '';
        }

        // Update profile name
        const profileName = document.getElementById('profile-name');
        if (profileName) {
            profileName.textContent = userDetails.name || '';
        }

        // Update profile email
        const profileEmail = document.getElementById('profile-email');
        if (profileEmail) {
            profileEmail.textContent = userDetails.email || '';
        }

        // Make the profile section visible if it's hidden
        const profileSection = document.querySelector('.profile-section');
        if (profileSection && profileSection.classList.contains('hidden')) {
            profileSection.classList.remove('hidden');
        }
    } else {
        console.error('User details not found in local storage.');
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    if (!token) {
        window.location.href = '/login.html';
        return;
    }
    
    // Initial data fetch
    showToast('Loading Dashboard...', toastTypes.INFO);
    updateProfile();
    fetchOrganizationsData();
    renderPCRequests();
    handleLogout();
    

    // Add event listeners for modal close buttons
    document.getElementById('close-admin-modal-btn')?.addEventListener('click', closeAssignAdminModal);
});

// Make functions globally available
window.openAssignAdminModal = openAssignAdminModal;
window.closeAssignAdminModal = closeAssignAdminModal;
window.openEditOrgModal = openEditOrgModal;
window.deleteOrganization = deleteOrganization;

// Add these functions for organization edit
async function openEditOrgModal(orgId) {
    try {
        // Get organization details from the table row
        const row = document.querySelector(`tr[data-org-id="${orgId}"]`);
        const orgName = row.querySelector('td:nth-child(2)').textContent;
        const orgAddress = row.querySelector('td:nth-child(3)').textContent;

        // Reuse the add organization modal
        const modal = document.getElementById('add-organization-modal');
        const form = document.getElementById('add-organization-form');
        
        // Update modal title
        modal.querySelector('h2').textContent = 'Edit Organization';
        
        // Set form values
        document.getElementById('organization-name').value = orgName;
        document.getElementById('organization-address').value = orgAddress;
        
        // Store the orgId in the form's dataset
        form.dataset.orgId = orgId;
        form.dataset.isEdit = 'true';
        
        // Show modal
        modal.classList.remove('hidden');
    } catch (error) {
        console.error('Error opening edit modal:', error);
        showToast('Error loading organization details', toastTypes.ERROR);
    }
}