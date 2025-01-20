const token = getSessionToken();
// Function to get session token from cookies
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

// Add these toast functions at the top of your file
const toastTypes = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
};

let toastCount = 0;
const toastQueue = [];

function showToast(message, type = toastTypes.INFO) {
    const toast = document.createElement('div');
    const toastId = toastCount++;
    
    toast.className = `fixed right-4 p-4 rounded-lg text-white ${
        type === toastTypes.SUCCESS ? 'bg-green-500' :
        type === toastTypes.ERROR ? 'bg-red-500' :
        type === toastTypes.WARNING ? 'bg-yellow-500' : 'bg-blue-500'
    } transition-all duration-300 ease-in-out`;
    
    toast.style.bottom = `${(toastQueue.length * 4.5)}rem`; // Stack from bottom
    toast.textContent = message;
    document.body.appendChild(toast);
    
    toastQueue.push({ id: toastId, element: toast });
    
    // Remove toast after delay
    setTimeout(() => {
        const index = toastQueue.findIndex(t => t.id === toastId);
        if (index !== -1) {
            const removedToast = toastQueue.splice(index, 1)[0];
            removedToast.element.style.opacity = '0';
            removedToast.element.style.transform = 'translateX(100%)';
            
            // Adjust positions of remaining toasts
            toastQueue.forEach((toast, i) => {
                toast.element.style.bottom = `${(i * 4.5)}rem`;
            });
            
            setTimeout(() => removedToast.element.remove(), 300);
        }
    }, 3000);
}

// Add modal close function
function closeAddOwnerModal() {
    const modal = document.getElementById('add-owner-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

if (!token) {
    console.error('Error: No session token found');
    showToast('Error: No session token found', toastTypes.ERROR);
}
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
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    });

    const data = await response.json();

    document.getElementById('active-sites').textContent = data.sites.length;
    document.getElementById('org-name-label').textContent = `${data.orgName}`;

    const tableBody = document.querySelector('#site-table tbody');
    tableBody.innerHTML = '';
    globalOrgId = data.orgId;

    const colors = ['red', 'green', 'blue'];
    let activeAdminCount = 0; // Initialize active admin count

    data.sites.forEach((site, index) => {
        const color = colors[index % colors.length];
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
                        <div class="text-sm text-gray-500">${site.siteAdminEmail || 'No email available'}</div>
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

        // Count active admins
        if (site.siteAdminName) {
            activeAdminCount++;
        }
    });

    // Update the active admins count in the UI
    document.querySelector('#active-admins-count').textContent = activeAdminCount;
    document.querySelector('#total-pcs-count').textContent = data.pcList?.length || 0;
}

// Use event delegation to handle "Edit", "Delete", and "Add Admin" button clicks
document.querySelector('#site-table tbody').addEventListener('click', (e) => {
    // Find the closest button element or its children
    const addAdminBtn = e.target.closest('.add-admin-btn');
    const editBtn = e.target.closest('.edit-btn');
    const deleteBtn = e.target.closest('.delete-btn');

    if (addAdminBtn) {
        const siteId = addAdminBtn.getAttribute('data-id');
        if (siteId) {
            document.getElementById('add-admin-modal').classList.remove('hidden');
            adminAddSiteId = siteId;
        } else {
            showToast('siteId is undefined', toastTypes.INFO);
        }
    }

    if (editBtn) {
        const siteId = editBtn.getAttribute('data-id');
        if (siteId) {
            showToast(`Cannot Edit site id: ${siteId} for now`, toastTypes.INFO);
        } else {
            showToast('siteId is undefined', toastTypes.INFO);
        }
    }

    if (deleteBtn) {
        const siteId = deleteBtn.getAttribute('data-id');
        if (siteId) {
            showToast(`Cannot Delete site id: ${siteId} for now`, toastTypes.INFO);
        } else {
            showToast('siteId is undefined', toastTypes.WARNING);
        }
    }
});

// Close the modal when the "Cancel" button is clicked
document.getElementById('close-site-modal-btn').addEventListener('click', () => {
    document.getElementById('add-admin-modal').classList.add('hidden');
    adminAddSiteId = null;
});

// Open the Add Site modal when the button is clicked
document.getElementById('add-site-btn').addEventListener('click', () => {
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
        siteAddress: document.getElementById('site-address').value
    };

    console.log('Site Data:', siteData); // Debugging line

    try {
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
            document.getElementById('add-site-modal').classList.add('hidden');
            fetchSitesData(); // Refresh the site data to reflect changes
            showToast(result.message || 'Site created successfully', toastTypes.SUCCESS);
        } else {
            showToast('Error: ' + (result.message || 'Failed to add site'), toastTypes.ERROR);
        }
    } catch (error) {
        console.error('Error creating site:', error);
        showToast('Error: Failed to create site', toastTypes.ERROR);
    }
});

async function assignSiteAdmin(siteId, adminData) {
    try {
        const response = await fetch('https://mdasriyashtttptrigger.azurewebsites.net/api/AssignSiteAdmin?', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`, // Ensure this token is valid
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ...adminData, siteId }) // Include siteId in the request
        });

        const result = await response.json();

        if (response.ok && result.status === 'success') {
            showToast(result.message || 'Site admin assigned successfully', toastTypes.SUCCESS);
            updateSiteAdminUI(siteId, adminData); // Update the UI with the new admin data
        } else {
            showToast('Error: ' + (result.message || 'Failed to assign site admin'), toastTypes.ERROR);
        }
    } catch (error) {
        console.error('Error assigning site admin:', error);
        showToast('Error: Failed to assign site admin', toastTypes.ERROR);
    }
}

// Submit the form to add a new admin dynamically
document.getElementById('add-admin-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Gather form data
    const adminData = {
        orgId: globalOrgId,
        userEmail: document.getElementById('admin-email').value,
        password: document.getElementById('admin-password').value,
        userName: document.getElementById('admin-name').value,
        userMobile1: document.getElementById('admin-mobile1').value,
        userMobile2: document.getElementById('admin-mobile2').value || "",
        userGender: document.getElementById('admin-gender').value,
        userAddress: document.getElementById('admin-address').value
    };

    await assignSiteAdmin(adminAddSiteId, adminData);
    document.getElementById('add-admin-modal').classList.add('hidden');
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

function updateSiteAdminUI(siteId, adminData) {
    const siteRow = document.querySelector(`[data-site-id="${siteId}"]`);
    if (siteRow) {
        const adminCell = siteRow.querySelector('.admin-cell');
        adminCell.innerHTML = `
            <div class="flex items-center">
                <div class="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <span class="text-sm font-medium text-gray-600">${adminData.userName.charAt(0)}</span>
                </div>
                <div class="ml-3">
                    <div class="text-sm font-medium text-gray-900">${adminData.userName}</div>
                    <div class="text-sm text-gray-500">${adminData.userEmail}</div>
                </div>
            </div>
        `;
    }
}

// Function to handle logout
function handleLogout() {
    // Clear any stored session data
    localStorage.removeItem('sessionToken');
    sessionStorage.removeItem('sessionToken');

    // Redirect to the login page
    window.location.href = '/login.html';
}

// Attach the logout function to a button
document.getElementById('logout-btn').addEventListener('click', handleLogout);

// Function to update the profile section
function updateProfileSection() {
    const storedDetails = localStorage.getItem('userDetails');
    if (!storedDetails) {
        console.log('No stored details found');
        return;
    }

    try {
        const userDetails = JSON.parse(storedDetails);
        
        // Update profile avatar initials
        const profileInitials = document.getElementById('profile-initials');
        if (profileInitials) {
            profileInitials.textContent = userDetails.initials || 'OA'; // Default initials
        }

        // Update name and email
        const profileName = document.getElementById('profile-name');
        if (profileName) {
            profileName.textContent = userDetails.name || 'Org Admin'; // Default name
        }

        const profileEmail = document.getElementById('profile-email');
        if (profileEmail) {
            profileEmail.textContent = userDetails.email || 'orgadmin@example.com'; // Default email
        }
    } catch (error) {
        console.error('Error updating profile:', error);
    }
}

// Call the function to update the profile section when the DOM is loaded
document.addEventListener('DOMContentLoaded', updateProfileSection);

// Add visual feedback functions
function addVisualFeedback() {
    // Add hover effects to cards (if any)
    document.querySelectorAll('.stats-card').forEach(card => {
        card.classList.add('card-hover');
    });

    // Add hover effects to table rows
    document.querySelectorAll('#site-table tbody tr').forEach(row => {
        row.classList.add('table-row-hover');
    });

    // Add input feedback
    document.querySelectorAll('input').forEach(input => {
        input.classList.add('input-primary');

        // Add validation feedback
        input.addEventListener('input', function() {
            if (this.checkValidity()) {
                this.classList.remove('input-error');
                this.classList.add('input-success');
            } else {
                this.classList.remove('input-success');
                this.classList.add('input-error');
            }
        });
    });

    // Add button feedback
    document.querySelectorAll('button').forEach(button => {
        if (button.classList.contains('btn-primary')) {
            button.addEventListener('click', function() {
                this.classList.add('transform', 'scale-95');
                setTimeout(() => {
                    this.classList.remove('transform', 'scale-95');
                }, 200);
            });
        }
    });
}

// Loading state feedback
function showLoading(element) {
    const originalContent = element.innerHTML;
    element.setAttribute('data-original-content', originalContent);
    element.innerHTML = `
        <div class="flex items-center space-x-2">
            <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Loading...</span>
        </div>
    `;
    element.disabled = true;
}

function hideLoading(element) {
    const originalContent = element.getAttribute('data-original-content');
    element.innerHTML = originalContent;
    element.disabled = false;
}

// Add search functionality
const searchInput = document.getElementById('site-search');
if (searchInput) {
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const tableRows = document.querySelectorAll('#site-table tbody tr:not(#no-results)');
        const noResults = document.getElementById('no-results');
        let hasResults = false;

        tableRows.forEach(row => {
            const siteName = row.querySelector('td:nth-child(1)').textContent.toLowerCase();
            if (siteName.includes(searchTerm)) {
                row.style.display = '';
                hasResults = true;
            } else {
                row.style.display = 'none';
            }
        });

        // Show/hide no results message
        if (!hasResults && searchTerm !== '') {
            noResults.classList.remove('hidden');
        } else {
            noResults.classList.add('hidden');
        }
    });
}

// Add logout animation function
function animateLogout(callback) {
    const logoutBtn = document.querySelector('#logout-btn');
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

    // Wait for animation and then execute callback
    setTimeout(callback, 1000);
}

// Update the handleLogout function with all cleanup
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

// Initialize visual feedback
document.addEventListener('DOMContentLoaded', function() {
    addVisualFeedback();
});

async function updatePcCount() {
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
        
        if (response.ok) {
            const pcCountElement = document.getElementById('total-pcs-count');
            if (pcCountElement) {
                // Update the count with the length of pcList or 0 if not available
                pcCountElement.textContent = data.pcList?.length || 0;
            }
        } else {
            throw new Error(data.message || 'Failed to fetch PC count');
        }
    } catch (error) {
        console.error('Error fetching PC count:', error);
        // Show error in the count element
        const pcCountElement = document.getElementById('total-pcs-count');
        if (pcCountElement) {
            pcCountElement.textContent = 'Error';
            pcCountElement.classList.add('text-red-500');
        }
    }
}

// Add this to your existing DOMContentLoaded event listener
