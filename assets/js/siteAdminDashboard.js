const token = getSessionToken();
let adminAddPcId = null;
let globalSiteId = null;

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

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', () => {
    updateProfileSection();
    fetchPcData();
    updatePcTable();
});

// Initialize page
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

function updatePcTable(pcList) {
    const tableBody = document.querySelector('#pc-table tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    pcList.forEach(pc => {
        const row = document.createElement('tr');
        row.classList.add('hover:bg-gray-50', 'transition-colors');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">${pc.pcName}</div>
                        <div class="text-sm text-gray-500">ID: PC${pc.pcId}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${pc.macAddress}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                ${pc.pcAdminName !== "Not Provided" ? 
                    `<div class="flex items-center">
                        <div class="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <span class="text-sm font-medium text-gray-600">${pc.pcAdminName.charAt(0)}</span>
                        </div>
                        <div class="ml-3">
                            <div class="text-sm font-medium text-gray-900">${pc.pcAdminName}</div>
                            <div class="text-sm text-gray-500">${pc.pcAdminEmail || ''}</div>
                        </div>
                    </div>` :
                    `<button data-pc-id="${pc.pcId}" 
                        class="add-admin-btn px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2">
                        <svg class="w-5 h-5 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span class="hidden md:inline">Add Admin</span>
                    </button>`
                }
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                ${pc.isApproved === 1 ? 
                    '<span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Approved</span>' : 
                    '<span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>'
                }
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex space-x-3">
                    <button class="text-indigo-600 hover:text-indigo-900 transition-colors" onclick="editPc(${pc.pcId})">
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                    <button class="text-red-600 hover:text-red-900 transition-colors" onclick="deletePc(${pc.pcId})">
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

    // Add event listeners to all Add Admin buttons
    document.querySelectorAll('.add-admin-btn').forEach(button => {
        button.addEventListener('click', function() {
            const pcId = this.dataset.pcId;
            showAddAdminModal(pcId);
        });
    });

    // Update PC count in dashboard
    const activePcCount = document.getElementById('active-pc');
    if (activePcCount) {
        activePcCount.textContent = pcList.length;
    }
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

// Function to fetch PC data
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
        console.log('PC Data received:', data); // Debug log

        if (response.ok) {
            // Set global site ID
            globalSiteId = data.siteId;
            
            // Update organization name label
            const orgNameLabel = document.getElementById('org-name-label');
            if (orgNameLabel) {
                orgNameLabel.innerHTML = data.orgName || 'N/A';
                orgNameLabel.className = 'text-gray-700';
            }
            
            // Update total PCs count
            const totalPcsElement = document.getElementById('total-pcs');
            if (totalPcsElement && data.pcList) {
                totalPcsElement.textContent = data.pcList.length;
            }

            // Update site name in the Site State card
            const activeSitesElement = document.getElementById('site-name');
            if (activeSitesElement && data.siteName) {
                activeSitesElement.textContent = data.siteName;
            }

            // Count PCs with admins assigned
            const adminsCount = data.pcList ? data.pcList.filter(pc => 
                pc.pcAdminName && pc.pcAdminName !== "Not Provided"
            ).length : 0;

            // Update Active Admins count
            const activeAdminsElement = document.getElementById('active-admins');
            if (activeAdminsElement) {
                activeAdminsElement.textContent = adminsCount;
            }
            
            // Update table with PC list
            updatePcTable(data.pcList || []);
        } else {
            throw new Error(data.message || 'Failed to fetch PC data');
        }
    } catch (error) {
        console.error('Error fetching PC data:', error);
        showToast('Error loading PC data', toastTypes.ERROR);
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

    if (!globalSiteId) {
        showToast('Site ID not found. Please refresh the page.', toastTypes.ERROR);
        return;
    }

    const pcData = {
        pcName: document.getElementById('pc-name').value,
        pcAddress: document.getElementById('pc-address').value,
        siteId: globalSiteId // Already ensured to be a number
    };

    console.log('Submitting PC data:', pcData); // Debug log

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
        console.log('API Response:', result); // Debug log

        if (response.ok) {
            document.getElementById('add-pc-modal').classList.add('hidden');
            document.getElementById('overlay').classList.add('hidden');
            document.getElementById('add-pc-form').reset();
            fetchPcData(); // Refresh the table
            showToast('PC added successfully', toastTypes.SUCCESS);
        } else {
            throw new Error(result.message || 'Failed to add PC');
        }
    } catch (error) {
        console.error('Error adding PC:', error);
        showToast(error.message || 'Error adding PC', toastTypes.ERROR);
    }
});

// Function to handle form submission
document.getElementById('add-admin-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const addAdminBtn = document.querySelector('.add-admin-btn');
    const pcId = addAdminBtn.dataset.pcId;

    if (!pcId) {
        showToast('No PC selected', toastTypes.ERROR);
        return;
    }

    const formData = {
        pcId: parseInt(pcId),
        userEmail: document.getElementById('admin-email').value,
        password: document.getElementById('admin-password').value,
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
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        
        if (response.ok && data.status === 'success') {
            showToast(data.message || 'Admin added successfully', toastTypes.SUCCESS);
            closeAddAdminModal();
            // Refresh the PC list to show the new admin
            fetchPcData();
        } else {
            throw new Error(data.message || 'Failed to add admin');
        }
    } catch (error) {
        console.error('Error adding admin:', error);
        showToast(error.message || 'Error adding admin', toastTypes.ERROR);
    }
});

// Modal functions
function showAddAdminModal(pcId) {
    const modal = document.getElementById('add-admin-modal');
    const overlay = document.getElementById('overlay');
    
    if (modal && overlay) {
        // Store pcId in the button's data attribute
        const addAdminBtn = modal.querySelector('.add-admin-btn');
        if (addAdminBtn) {
            addAdminBtn.dataset.pcId = pcId;
        }
        
        modal.classList.remove('hidden');
        overlay.classList.remove('hidden');
    }
}

function closeAddAdminModal() {
    const modal = document.getElementById('add-admin-modal');
    const overlay = document.getElementById('overlay');
    const form = document.getElementById('add-admin-form');
    
    if (modal && overlay) {
        modal.classList.add('hidden');
        overlay.classList.add('hidden');
    }
    
    if (form) {
        form.reset();
    }
}

function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    input.type = input.type === 'password' ? 'text' : 'password';
}

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

// Function to update profile section with user details
function updateProfileSection() {
    try {
        const userDetailsStr = localStorage.getItem('userDetails');
        if (!userDetailsStr) {
            console.log('No user details found');
            return;
        }

        const userDetails = JSON.parse(userDetailsStr);
        
        // Update profile avatar initials
        const profileInitials = document.querySelector('.profile-avatar span');
        if (profileInitials) {
            profileInitials.textContent = userDetails.initials || 'SA';
        }

        // Update name and email
        const profileName = document.querySelector('.profile-info-name');
        if (profileName) {
            profileName.textContent = userDetails.name || 'Site Admin';
        }

        const profileEmail = document.querySelector('.profile-info-email');
        if (profileEmail) {
            profileEmail.textContent = userDetails.email || 'admin@example.com';
        }
    } catch (error) {
        console.error('Error updating profile:', error);
    }
}
