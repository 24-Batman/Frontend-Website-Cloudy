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

function closeadminmodal(){
    document.getElementById('add-admin-modal').classList.add('hidden');
    document.getElementById('add-admin-form').reset();
    adminAddOrgId = null;
}

function closeAddOrgModal(){
    const modal = document.getElementById('add-organization-modal');
    const form = document.getElementById('add-organization-form');
    const overlay = document.getElementById('overlay');
    overlay.classList.add('hidden');
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
    const model = document.getElementById('add-admin-modal');
    const form = document.getElementById('add-admin-form');
    const overlay = document.getElementById('overlay');
    
    model.classList.add('hidden');
    overlay.classList.add('hidden');
    
    if (form) {
        form.reset();
    }
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

// PC Approval Functions
async function fetchNotApprovedPCs() {
    const container = document.getElementById('notification-container');
    if (!container) return;

    try {
        // Show loading state
        container.innerHTML = `
            <div class="flex items-center justify-center py-8">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        `;

        const response = await fetch(API_URLS.getNotApprovedPcList, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ dummy: null })
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        console.log('PC Requests:', data);

        // Handle the array structure directly
        if (Array.isArray(data)) {
            updateNotificationBadge(data.length);
            renderPCRequests(data);
        } 
        // Handle the nested structure
        else if (data && Array.isArray(data.pcRequests)) {
            updateNotificationBadge(data.pcRequests.length);
            renderPCRequests(data.pcRequests);
        }
        // Handle the pcList structure
        else if (data && Array.isArray(data.pcList)) {
            updateNotificationBadge(data.pcList.length);
            renderPCRequests(data.pcList);
        }
        else {
            throw new Error('No PC requests data found');
        }
    } catch (error) {
        console.error('Error fetching PC requests:', error);
        container.innerHTML = `
            <div class="text-center py-6 px-4">
                <div class="bg-red-50 rounded-lg p-4 mb-4">
                    <div class="flex items-center">
                        <i class='bx bx-error-circle text-3xl text-red-500 mr-3'></i>
                        <div>
                            <h3 class="text-lg font-medium text-red-800">Unable to load PC requests</h3>
                            <p class="text-sm text-red-700 mt-1">${error.message}</p>
                        </div>
                    </div>
                </div>
                <button onclick="retryFetchPCs()" 
                    class="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                    <i class='bx bx-refresh mr-2'></i>
                    Try Again
                </button>
            </div>
        `;
    }
}

function updateNotificationBadge(count) {
    const badge = document.getElementById('notification-badge');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'block' : 'none';
    }
}

function renderPCRequests(pcList) {
    const container = document.getElementById('notification-container');
    if (!container) return;

    // Filter only non-approved PCs
    const pendingPCs = pcList.filter(pc => !pc.isApproved);

    if (!pendingPCs || pendingPCs.length === 0) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center py-8 px-4">
                <div class="bg-green-50 rounded-full p-3 mb-4">
                    <i class='bx bx-check text-4xl text-green-500'></i>
                </div>
                <h3 class="text-lg font-medium text-gray-900">All Clear!</h3>
                <p class="text-sm text-gray-500 mt-1">No pending PC requests to review</p>
            </div>
        `;
        return;
    }

    let html = `
        <div class="grid gap-4 p-4">
            ${pendingPCs.map(pc => `
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                    <div class="p-4">
                        <div class="flex items-center justify-between mb-4">
                            <div class="flex items-center space-x-3">
                                <div class="flex-shrink-0">
                                    <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <i class='bx bx-desktop text-indigo-600 text-xl'></i>
                    </div>
                </div>
                                <div>
                                    <h4 class="text-lg font-medium text-gray-900">${pc.pcName || pc.name || 'Unnamed PC'}</h4>
                                    <p class="text-sm text-gray-500">${pc.orgName || 'Organization not specified'}</p>
                                </div>
                            </div>
                            <span class="px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Pending
                            </span>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4 mb-4 text-sm">
                            <div>
                                <p class="text-gray-500 mb-1">Department</p>
                                <p class="font-medium text-gray-900">${pc.department || 'No Department'}</p>
                            </div>
                            <div>
                                <p class="text-gray-500 mb-1">Site</p>
                                <p class="font-medium text-gray-900">${pc.siteName || 'Not Specified'}</p>
                            </div>
                            <div>
                                <p class="text-gray-500 mb-1">Created By</p>
                                <p class="font-medium text-gray-900">${pc.creatorName || 'Unknown'}</p>
                            </div>
                            <div>
                                <p class="text-gray-500 mb-1">Role</p>
                                <p class="font-medium text-gray-900">${pc.creatorRole || 'Not Specified'}</p>
                            </div>
                    </div>

                        <div class="bg-gray-50 -mx-4 -mb-4 px-4 py-3">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center space-x-2 text-sm text-gray-500">
                                    <i class='bx bx-chip'></i>
                                    <span>${pc.pcMacAddress || 'MAC Address not available'}</span>
                    </div>
                                <div class="flex space-x-2">
                                    <button onclick="handlePCAction(${pc.pcId}, true)"
                                        class="inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                                        <i class='bx bx-check mr-1.5'></i>
                                        Approve
                        </button>
                                    <button onclick="handlePCAction(${pc.pcId}, false)"
                                        class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                                        <i class='bx bx-x mr-1.5'></i>
                                        Reject
                        </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    container.innerHTML = html;
}

async function handlePCAction(pcId, isApproved) {
    try {
        const actionButton = event.target.closest('button');
        const originalContent = actionButton.innerHTML;
        
        // Show loading state
        actionButton.disabled = true;
        actionButton.innerHTML = `
            <div class="flex items-center">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-${isApproved ? 'white' : 'gray-700'} mr-2"></div>
                ${isApproved ? 'Approving...' : 'Rejecting...'}
            </div>
        `;

        // Disable both buttons while processing
        const pcCard = actionButton.closest('.bg-white');
        if (pcCard) {
            const buttons = pcCard.querySelectorAll('button');
            buttons.forEach(btn => {
                btn.disabled = true;
            });
        }

        const response = await fetch(API_URLS.approvePc, {
        method: 'POST',
        headers: {
                'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
            body: JSON.stringify({
                "pcId": pcId,
                "status": isApproved ? "Approve" : "Reject"
            })
    });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

    const result = await response.json();
        console.log('PC action result:', result); // For debugging
        
        // Check for both approve and reject success conditions
        if (result.status === "Pc approved" || 
            result.status === "Success" || 
            result.status === "Pc rejected" || 
            result.message?.toLowerCase().includes('rejected') ||
            result.message?.toLowerCase().includes('approved')) {
            
            showToast(`PC ${isApproved ? 'approved' : 'rejected'} successfully`, toastTypes.SUCCESS);
            
            // Remove the PC card with animation
            if (pcCard) {
                pcCard.style.transition = 'all 0.5s ease-out';
                pcCard.style.opacity = '0';
                pcCard.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    pcCard.remove();
                    // Check if there are any remaining PC cards
                    const container = document.getElementById('notification-container');
                    if (container && !container.querySelector('.bg-white')) {
                        // No more PCs to approve/reject
                        container.innerHTML = `
                            <div class="flex flex-col items-center justify-center py-8 px-4">
                                <div class="bg-green-50 rounded-full p-3 mb-4">
                                    <i class='bx bx-check text-4xl text-green-500'></i>
                                </div>
                                <h3 class="text-lg font-medium text-gray-900">All Clear!</h3>
                                <p class="text-sm text-gray-500 mt-1">No pending PC requests to review</p>
                            </div>
                        `;
                    }
                }, 500);
            }

            // Update notification badge
            const remainingCards = document.querySelectorAll('#notification-container .bg-white').length - 1;
            updateNotificationBadge(remainingCards);
        } else {
            throw new Error(result.message || `Failed to ${isApproved ? 'approve' : 'reject'} PC`);
        }
    } catch (error) {
        console.error('Error processing PC request:', error);
        showToast(error.message, toastTypes.ERROR);
        
        // Restore button states
        if (pcCard) {
            const buttons = pcCard.querySelectorAll('button');
            buttons.forEach(btn => {
                btn.disabled = false;
                if (btn === actionButton) {
                    btn.innerHTML = originalContent;
                }
            });
        }
    }
}

function showApprovePC() {
    const modal = document.getElementById('approve-pc-card');
    if (modal) {
        modal.classList.remove('hidden');
        fetchNotApprovedPCs();
    }
}

function closeApprovePC() {
    const modal = document.getElementById('approve-pc-card');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Make these functions globally available
window.showApprovePC = showApprovePC;
window.closeApprovePC = closeApprovePC;
window.handlePCAction = handlePCAction;

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
document.addEventListener('DOMContentLoaded', async () => {
    if (!token) {
        window.location.href = '/login.html';
        return;
    }
    
    try {
        await Promise.all([
            fetchOrganizationsData(),
            fetchNotApprovedPCs() // Fetch PC requests on page load
        ]);
        updateProfile();
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        showToast('Error loading dashboard data', toastTypes.ERROR);
    }
});

// Make functions globally available
window.handleLogout = function() {
    animateLogout(() => {
        localStorage.clear();
        document.cookie = 'sessionToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        window.location.href = '/login.html';
    });
};

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

// Add retry function
function retryFetchPCs() {
    fetchNotApprovedPCs();
}

// Make retry function globally available
window.retryFetchPCs = retryFetchPCs;

// Function to delete an organization
function deleteOrganization(orgId) {
    if (confirm('Are you sure you want to delete this organization?')) {
        fetch(`${API_URLS.deleteOrgOwner}/${orgId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                showToast('Organization deleted successfully!', toastTypes.SUCCESS);
                fetchOrganizationsData(); // Refresh the organization list
            } else {
                showToast(data.message || 'Failed to delete organization', toastTypes.ERROR);
            }
        })
        .catch(error => {
            console.error('Error deleting organization:', error);
            showToast('Error deleting organization', toastTypes.ERROR);
        });
    }
}