// Toast notification system
const toastTypes = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning'
};

function showToast(message, type = toastTypes.SUCCESS) {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');

    // Set base classes
    toast.className = `transform transition-all duration-300 ease-in-out flex items-center p-4 mb-3 rounded-lg shadow-lg max-w-xs translate-x-0`;

    // Configure toast based on type
    let iconSvg = '';
    switch (type) {
        case toastTypes.SUCCESS:
            toast.classList.add('bg-green-500', 'text-white');
            iconSvg = `
                <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>`;
            break;
        case toastTypes.ERROR:
            toast.classList.add('bg-red-500', 'text-white');
            iconSvg = `
                <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>`;
            break;
        case toastTypes.WARNING:
            toast.classList.add('bg-yellow-500', 'text-white');
            iconSvg = `
                <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>`;
            break;
    }

    toast.innerHTML = `
        <div class="flex items-center">
            ${iconSvg}
            <span class="text-sm font-medium">${message}</span>
        </div>
        <button class="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 text-white hover:bg-opacity-25 focus:outline-none">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
        </button>
    `;

    // Add toast to container
    toastContainer.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
        toast.classList.add('translate-x-0', 'opacity-100');
    });

    // Add click handler to close button
    const closeButton = toast.querySelector('button');
    closeButton.addEventListener('click', () => removeToast(toast));

    // Auto remove after 3 seconds
    setTimeout(() => removeToast(toast), 3000);
}

function removeToast(toast) {
    toast.classList.add('opacity-0', 'translate-x-full');
    setTimeout(() => toast.remove(), 300);
}

function showToast(message, type = toastTypes.SUCCESS) {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');

    // Set base classes
    toast.className = `transform transition-all duration-300 ease-in-out flex items-center p-4 mb-3 rounded-lg shadow-lg max-w-xs translate-x-0`;

    // Configure toast based on type
    let iconSvg = '';
    switch (type) {
        case toastTypes.SUCCESS:
            toast.classList.add('bg-green-500', 'text-white');
            iconSvg = `
                <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>`;
            break;
        case toastTypes.ERROR:
            toast.classList.add('bg-red-500', 'text-white');
            iconSvg = `
                <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>`;
            break;
        case toastTypes.WARNING:
            toast.classList.add('bg-yellow-500', 'text-white');
            iconSvg = `
                <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>`;
            break;
    }

    toast.innerHTML = `
        <div class="flex items-center">
            ${iconSvg}
            <span class="text-sm font-medium">${message}</span>
        </div>
        <button class="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 text-white hover:bg-opacity-25 focus:outline-none">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
        </button>
    `;

    // Add toast to container
    toastContainer.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
        toast.classList.add('translate-x-0', 'opacity-100');
    });

    // Add click handler to close button
    const closeButton = toast.querySelector('button');
    closeButton.addEventListener('click', () => removeToast(toast));

    // Auto remove after 3 seconds
    setTimeout(() => removeToast(toast), 3000);
}

// Function to get color classes based on the organization's color theme
function getColorClasses(color) {
    const colorMap = {
        blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
        purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
        green: { bg: 'bg-green-100', text: 'text-green-600' },
        indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600' }
    };
    return colorMap[color] || colorMap.blue; // Default to blue if color not found
}

// Global variable for PC requests
let pcRequests = [
    {
        id: "PC001",
        orgName: "MRP Pvt Ltd",
        siteName: "Ambatur Factory",
        pcName: "PC for A block",
        addedBy: "Mouli",
        role: "Site Admin"
    },
    {
        id: "PC002",
        orgName: "Texon Pvt Ltd",
        siteName: "Polaachi",
        pcName: "PC for B block",
        addedBy: "Riyas",
        role: "Org Admin"
    },
    {
        id: "PC003",
        orgName: "ABC Corp",
        siteName: "Chennai",
        pcName: "PC for C block",
        addedBy: "John",
        role: "Site Admin"
    },
    {
        id: "PC004",
        orgName: "XYZ Ltd",
        siteName: "Coimbatore",
        pcName: "PC for D block",
        addedBy: "Alice",
        role: "Org Admin"
    },
    {
        id: "PC005",
        orgName: "Global Tech",
        siteName: "Bangalore",
        pcName: "PC for E block",
        addedBy: "Sam",
        role: "Site Admin"
    },
    {
        id: "PC006",
        orgName: "Innovate Solutions",
        siteName: "Hyderabad",
        pcName: "PC for F block",
        addedBy: "Emma",
        role: "Org Admin"
    },
    {
        id: "PC007",
        orgName: "Future Enterprises",
        siteName: "Mumbai",
        pcName: "PC for G block",
        addedBy: "Liam",
        role: "Site Admin"
    },
    {
        id: "PC008",
        orgName: "Tech Innovations",
        siteName: "Delhi",
        pcName: "PC for H block",
        addedBy: "Olivia",
        role: "Org Admin"
    }
];
// JavaScript to handle modal display and form submission
document.getElementById('btn-add-org').addEventListener('click', function () {
    document.getElementById('add-organization-modal').classList.remove('hidden');
});

document.getElementById('close-org-modal-btn').addEventListener('click', function () {
    document.getElementById('add-organization-modal').classList.add('hidden');
});

document.getElementById('add-organization-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Gather form data in the exact format required by the API
    const organizationData = {
        "orgName": document.getElementById('organization-name').value,
        "orgAddress": document.getElementById('organization-address').value,
        "regYear": document.getElementById('organization-reg-year').value,
        "gstNumber": document.getElementById('organization-gst').value
    };

    try {
        // Make the API request
        const response = await fetch(API_URLS.createOrg, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(organizationData)
        });

        const result = await response.json();

        if (response.ok && result.status === 'success') {
            // Hide the modal after successful creation
            document.getElementById('add-organization-modal').classList.add('hidden');
            
            // Refresh the organizations list
            await fetchOrganizationsData();
            
            // Show success message
            showToast(result.message || 'Organization created successfully', toastTypes.SUCCESS);
        } else {
            // Show error message
            showToast(result.message || 'Failed to add organization', toastTypes.ERROR);
        }
    } catch (error) {
        console.error('Error creating organization:', error);
        showToast('Error: Failed to create organization', toastTypes.ERROR);
    }
});

// JavaScript to handle sidebar toggle
document.getElementById('sidebar-toggle').addEventListener('click', function () {
    const sidebar = document.getElementById('drawer-navigation');
    if (sidebar.classList.contains('-translate-x-full')) {
        sidebar.classList.remove('-translate-x-full');
    } else {
        sidebar.classList.add('-translate-x-full');
    }
});


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

function handleLogout() {
    // Implement logout functionality
}

function showOrgDetails(name, address, adminName) {
    const detailsContent = document.getElementById('org-details-content');
    detailsContent.innerHTML = `
                <p><strong>Organization Name:</strong> ${name}</p>
                <p><strong>Address:</strong> ${address}</p>
                <p><strong>Admin Name:</strong> ${adminName}</p>
            `;
    document.getElementById('org-details-modal').classList.remove('hidden');
}

function closeOrgDetails() {
    document.getElementById('org-details-modal').classList.add('hidden');
}
// Function to update the notification count
function updateNotificationCount() {
    const countElement = document.getElementById('not-approved-pc-count');
    if (countElement) {
        countElement.textContent = pcRequests.length; // Update the badge with the current count
    }
}
const currentYear = new Date().getFullYear(); // Get the current year
const yearInput = document.getElementById('organization-reg-year');
yearInput.max = currentYear; // Set the max value dynamically to the current year
const token = getSessionToken();
// Fetch data when the page loads
// fetchOrganizationsData();

var adminAddOrgId = null;

function updateProfileSection() {

    const storedDetails = localStorage.getItem('userDetails');
    if (!storedDetails) {
        // console.log('No stored details found');
        return;
    }

    try {
        const userDetails = JSON.parse(storedDetails);
        // Update profile avatar initials
        const profileInitials = document.querySelector('.profile-avatar span');
        if (profileInitials) {
            profileInitials.textContent = userDetails.initials || 'SA';
        } else {
            profileInitials.textContent = 'N/A';
        }

        // Update name and email
        const profileName = document.querySelector('.profile-info-name');
        if (profileName) {
            profileName.textContent = userDetails.name || 'Super Admin';
        } else {
            profileName.textContent = 'N/A';
        }

        const profileEmail = document.querySelector('.profile-info-email');
        if (profileEmail) {
            profileEmail.textContent = userDetails.email || 'admin@example.com';
        } else {
            profileEmail.textContent = 'N/A';
        }
    } catch (error) {
        console.error('Error updating profile:', error);
    }
}

// Set the max value of the registration year input dynamically
document.addEventListener('DOMContentLoaded', () => {
    const currentYear = new Date().getFullYear(); // Get the current year
    document.getElementById('organization-reg-year').max = currentYear;
    updateNotificationCount();
    fetchOrganizationsData();
    updateDashboardStats();
    updateProfileSection();
    const actionButtons = `
        <div class="flex space-x-3">
            <button onclick="handlePCAction('${org.id}', 'Approve')" 
                    class="${colors.text} hover:${colors.text}-dark transition-colors">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
            </button>
            <button onclick="handlePCAction('${org.id}', 'Reject')" 
                    class="text-red-600 hover:text-red-900 transition-colors">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>
        </div>
    `;
});

async function updateDashboardStats() {
    try {
        const token = document.cookie
            .split('; ')
            .find(row => row.startsWith('sessionToken='))
            ?.split('=')[1];

        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(API_URLS.getOrgList, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "dummy": null })
        });

        const data = await response.json();

        if (data.status === "success" && Array.isArray(data.organizations)) {
            // Count organizations with and without admins
            const orgsWithAdmin = data.organizations.filter(org => 
                org.organizationAdminName && org.organizationAdminName !== "No Admin Assigned"
            ).length;

            const orgsWithoutAdmin = data.organizations.filter(org => 
                !org.organizationAdminName || org.organizationAdminName === "No Admin Assigned"
            ).length;

            // Update total organizations card
            const totalOrganizations = document.getElementById('total-organizations');
            if (totalOrganizations) {
                totalOrganizations.textContent = data.organizations.length;
            }

            // Update active admin instances card
            const activeAdminCount = document.getElementById('active-sites');
            if (activeAdminCount) {
                activeAdminCount.textContent = orgsWithAdmin;
            }

            // Update assign admin card
            const assignAdminCount = document.getElementById('admin-assign-count');
            if (assignAdminCount) {
                assignAdminCount.textContent = orgsWithoutAdmin;
            }
        } else {
            console.error('Unexpected data format:', data);
        }
    } catch (error) {
        console.error('Error updating dashboard stats:', error);
        // Optionally show error in UI
        showToast('Error updating dashboard statistics', toastTypes.ERROR);
    }
}
// Function to fetch and display organizations
async function fetchOrganizationsData() {
    try {
        const token = document.cookie
            .split('; ')
            .find(row => row.startsWith('sessionToken='))
            ?.split('=')[1];

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
            body: JSON.stringify({
                "dummy": null
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const tableBody = document.querySelector('#organizations-table tbody');
        
        if (!tableBody) {
            throw new Error('Table body element not found');
        }

        // Clear existing table content
        tableBody.innerHTML = '';

        if (data.status === "success" && Array.isArray(data.organizations)) {
            data.organizations.forEach(org => {
                const row = document.createElement('tr');
                row.classList.add('hover:bg-gray-50', 'transition-colors');
                
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${org.organizationId || '-'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${org.organizationName || '-'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${org.organizationAddress || '-'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                        ${org.organizationAdminName === "No Admin Assigned" ? 
                            `<button type="button" 
                                onclick="openAssignAdminModal('${org.organizationId}')"
                                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors">
                                <i class='bx bx-plus mr-1'></i>
                                Add Admin
                            </button>` : 
                            `<span class="text-gray-900">${org.organizationAdminName}</span>`
                        }
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                        <div class="flex space-x-3">
                            <button type="button" 
                                onclick="openEditOrgModal('${org.organizationId}')"
                                class="text-indigo-600 hover:text-indigo-900 transition-colors">
                                <i class='bx bx-edit-alt text-xl'></i>
                            </button>
                            <button type="button"
                                onclick="deleteOrganization('${org.organizationId}')"
                                class="text-red-600 hover:text-red-900 transition-colors">
                                <i class='bx bx-trash text-xl'></i>
                            </button>
                        </div>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        } else {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                        ${data.message || 'No organizations found'}
                    </td>
                </tr>
            `;
        }
    } catch (error) {
        console.error('Error fetching organizations:', error);
        const tableBody = document.querySelector('#organizations-table tbody');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-4 text-center text-red-500">
                        Error loading organizations: ${error.message}
                    </td>
                </tr>
            `;
        }
    }
}

// // Function to get token from cookie
// function getToken() {
//     return document.cookie
//         .split('; ')
//         .find(row => row.startsWith('sessionToken='))
//         ?.split('=')[1];
// }

// Function to open assign admin modal
function openAssignAdminModal(orgId) {
    const modal = document.getElementById('add-admin-modal');
    if (modal) {
        // Store the organization ID for use when submitting the form
        modal.dataset.orgId = orgId;
        modal.classList.remove('hidden');
    }
}

// Function to open edit organization modal
function openEditOrgModal(orgId) {
    // Implement edit organization functionality
    console.log('Edit organization:', orgId);
}

// Function to delete organization
function deleteOrganization(orgId) {
    if (confirm('Are you sure you want to delete this organization?')) {
        // Implement delete organization functionality
        console.log('Delete organization:', orgId);
    }
}


//open add organization modal to add organization
document.querySelector('.bg-indigo-600').addEventListener('click', () => {
    document.getElementById('add-organization-modal').classList.remove('hidden');
});
// Close the modal when the "Cancel" button is clicked
document.getElementById('close-org-modal-btn').addEventListener('click', () => {
    document.getElementById('add-organization-modal').classList.add('hidden');
});
//create org when the form is submited
document.getElementById('add-organization-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Gather form data
    const organizationData = {
        orgName: document.getElementById('organization-name').value,
        orgAddress: document.getElementById('organization-address').value,
        regYear: document.getElementById('organization-reg-year').value,
        gstNumber: document.getElementById('organization-gst').value
    };

    // Make the API request
    const response = await fetch(API_URLS.createOrg, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,  // Replace with actual Auth token
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(organizationData)
    });

    const result = await response.json();

    if (response.ok && result.status === 'success') {
        // Hide the modal after successful creation
        document.getElementById('add-organization-modal').classList.add('hidden');

        fetchOrganizationsData();

        // Optional: Provide feedback to the user
        alert(result.message); // User feedback (success message)
    } else {
        // Handle errors
        alert('Error: ' + (result.message || 'Failed to add organization'));
    }
});


// Use event delegation to handle "Edit" and "Delete" button clicks
document.querySelector('#organization-table tbody').addEventListener('click', (e) => {
    // Check if the clicked element has a data-id attribute and the correct class
    if (e.target && e.target.classList.contains('edit-btn')) {
        const orgId = e.target.getAttribute('data-id');
        if (orgId) {
            window.alert(`Edit org id: ${orgId}`);
        }
        else {
            console.error('orgId is undefined');
        }
    }

    if (e.target && e.target.classList.contains('delete-btn')) {
        const orgId = e.target.getAttribute('data-id');
        if (orgId) {
            window.alert(`Delete org id: ${orgId}`);
        } else {
            console.error('orgId is undefined');
        }
    }
    if (e.target && e.target.classList.contains('add-admin-btn')) {
        const orgId = e.target.getAttribute('data-id');
        if (orgId) {
            document.getElementById('add-admin-modal').classList.remove('hidden');
            adminAddOrgId = orgId;
        } else {
            console.error('orgId is undefined');
        }
    }
});

// Close the modal when the "Cancel" button is clicked
document.getElementById('close-admin-modal-btn').addEventListener('click', () => {
    document.getElementById('add-admin-modal').classList.add('hidden');
    adminAddOrgId = null;
});

// Submit the form to add a new admin
document.getElementById('add-admin-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    // Gather form data
    const adminData = {
        orgId: adminAddOrgId,
        userEmail: document.getElementById('admin-email').value,
        password: document.getElementById('admin-password').value, // Example password, adjust as needed
        userRole: "Organization Admin",
        userName: document.getElementById('admin-name').value,
        userMobile1: document.getElementById('admin-mobile1').value,
        userMobile2: document.getElementById('admin-mobile2') ? document.getElementById('admin-mobile2').value : "", // Optional field
        userGender: document.getElementById('admin-gender').value, // Default gender, adjust as needed
        userAddress: document.getElementById('admin-address').value
    };

    // Make the API request
    const response = await fetch(API_URLS.assignOrgAdmin, {
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
        fetchOrganizationsData(); // Call your function to update the dashboard with new admin details

        // Optional: Provide feedback to the user
        alert(result.message); // User feedback (success message)
    } else {
        // Handle errors
        alert('Error: ' + (result.message || 'Failed to add admin'));
    }
});



//open the not approved pc page if we click the not approved pc count
document.getElementById('btn-not-approved-pc').addEventListener('click', () => {
    document.getElementById('not-approved-pc-modal').classList.remove('hidden');
    fetchNotApprovedPcList();
});
// Close the modal when the "Cancel" button is clicked
document.getElementById('close-pc-modal-btn').addEventListener('click', () => {
    document.getElementById('not-approved-pc-modal').classList.add('hidden');
});
//approve or reject pc
async function fetchNotApprovedPcList() {
    const url = API_URLS.getNotApprovedPcList;
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

    document.getElementById('not-approved-pc-count-lable').textContent = `${data.length} PC's Not Approved`;
    document.getElementById('not-approved-pc-count').textContent = `${data.length}`;

    // Populate the table
    const tableBody = document.querySelector('#not-approved-pc-table tbody');
    tableBody.innerHTML = ''; // Clear the existing table data

    data.forEach(pc => {
        const row = document.createElement('tr');
        row.classList.add('text-sm', 'text-gray-700');

        row.innerHTML = `
            <td class="px-6 py-3">${pc.orgName}</td>
            <td class="px-6 py-3">${pc.siteName}</td>
            <td class="px-6 py-3">${pc.pcName}</td>
            <td class="px-6 py-3">${pc.addedBy}</td>
            <td class="px-6 py-3">${pc.creatorRole}</td>
            <td class="px-6 py-3 text-right">
                <button class="approve-btn px-4 py-2 bg-blue-600 text-white rounded-lg" data-id="${pc.pcId}">Approve</button>
                <button class="reject-btn px-4 py-2 bg-red-600 text-white rounded-lg" data-id="${pc.pcId}}">Reject</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Use event delegation to handle "Edit" and "Delete" button clicks
document.querySelector('#not-approved-pc-table tbody').addEventListener('click', (e) => {
    if (e.target && e.target.classList.contains('approve-btn')) {
        const pcId = e.target.getAttribute('data-id');
        // Find the parent row of the clicked button
        const row = e.target.closest('tr');
        // Extract pcName from the row (assuming pcName is in the 3rd <td>)
        const pcName = row.querySelector('td:nth-child(3)').textContent;
        if (pcId) {
            // Show a confirmation dialog
            const isApproved = window.confirm(`Do you want to approve PC : ${pcName}?`);
            // If the user clicks "Yes" (OK)
            if (isApproved) {
                const pcDataApprove = {
                    pcId: pcId,
                    status: "Approve"
                };
                approveOrRejectPc(pcDataApprove);
            }
        }
    }
    if (e.target && e.target.classList.contains('reject-btn')) {
        const pcId = e.target.getAttribute('data-id');
        // Find the parent row of the clicked button
        const row = e.target.closest('tr');
        // Extract pcName from the row (assuming pcName is in the 3rd <td>)
        const pcName = row.querySelector('td:nth-child(3)').textContent;
        if (pcId) {
            // Show a confirmation dialog
            const isApproved = window.confirm(`Do you want to Reject PC : ${pcName}?`);
            // If the user clicks "Yes" (OK)
            if (isApproved) {
                const pcDataApprove = {
                    pcId: pcId,
                    status: "Reject"
                };
                approveOrRejectPc(pcDataApprove);
            }
        }
    }
});
//approve or reject pc function
async function approveOrRejectPc(pcData) {
    const url = API_URLS.approveOrRejectPc;
    const requestBody = pcData;
    const response = await fetch(url, {
        method: 'POST', // Using POST method
        headers: {
            'Authorization': `Bearer ${token}`, // Replace with your actual token
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });

    const data = await response.json(); // Parse the JSON response

    if (response.ok) {
        // Hide the modal after successful creation
        //document.getElementById('add-admin-modal').classList.add('hidden');

        fetchNotApprovedPcList();
        // Optional: Provide feedback to the user
        alert(data.message); // User feedback (success message)
    } else {
        // Handle errors
        alert('Error: ' + (data.message || 'Failed to add admin'));
    }
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

// Function to show the Add Admin modal
function showAddAdminModal() {
    const modal = document.getElementById('add-admin-modal');
    if (modal) {
        modal.classList.remove('hidden');
        showToast('Please fill in the admin details', toastTypes.WARNING);
    }
}