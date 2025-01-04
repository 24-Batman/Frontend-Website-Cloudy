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

// Add visual feedback functions
function addVisualFeedback() {
    // Add hover effects to cards
    document.querySelectorAll('.stats-card').forEach(card => {
        card.classList.add('card-hover');
    });

    // Add hover effects to table rows
    document.querySelectorAll('#owners-table tbody tr').forEach(row => {
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

// Form validation feedback
function showInputError(input, message) {
    input.classList.add('input-error');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'text-red-500 text-sm mt-1';
    errorDiv.textContent = message;
    input.parentNode.appendChild(errorDiv);
}

function clearInputError(input) {
    input.classList.remove('input-error');
    const errorDiv = input.parentNode.querySelector('.text-red-500');
    if (errorDiv) {
        errorDiv.remove();
    }
}

// Success feedback
function showSuccess(element) {
    element.classList.add('input-success');
    const checkmark = document.createElement('div');
    checkmark.className = 'absolute right-2 top-1/2 transform -translate-y-1/2 text-green-500';
    checkmark.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
    `;
    element.parentNode.appendChild(checkmark);
}

// Function to fetch and update user details
async function refreshUserDetails() {
    try {
        const response = await fetch(API_URLS.login + '&verify=true', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userEmail: localStorage.getItem('userEmail'),
                password: localStorage.getItem('userPassword')
            })
        });
        
        const data = await response.json();
        if (data.status === 'Verified') {
            const userDetails = data.userDetails;
            localStorage.setItem('userDetails', JSON.stringify({
                name: userDetails.userName,
                email: userDetails.userEmail,
                role: data.role,
                initials: userDetails.userName.split(' ').map(n => n[0]).join('').toUpperCase()
            }));
            
            updateProfileSection();
        }
    } catch (error) {
        console.error('Error refreshing user details:', error);
    }
}

// Refresh user details every 5 minutes (optional)
setInterval(refreshUserDetails, 5 * 60 * 1000);

// Update the profile section function
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

// Add variables to track previous values
let previousOrgCount = 0;
let previousOwnerCount = 0;

// Function to calculate percentage change
function calculatePercentageChange(oldValue, newValue) {
    if (oldValue === 0) return { value: 0, increase: true };
    const change = ((newValue - oldValue) / oldValue) * 100;
    return {
        value: Math.abs(Math.round(change)),
        increase: change >= 0
    };
}

// Function to update dashboard stats
async function updateDashboardStats() {
    try {
        // Fetch organizations count
        const orgResponse = await fetch(API_URLS.getOrgList, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "dummy": null })
        });
        
        const orgData = await orgResponse.json();
        if (orgData.status === 'success' && orgData.organizations) {
            const newOrgCount = orgData.organizations.length;
            const orgChange = calculatePercentageChange(previousOrgCount, newOrgCount);
            
            // Update organizations count and percentage
            const orgCountElement = document.getElementById('active-sites');
            const orgPercentElement = document.getElementById('org-percent');
            const orgArrowElement = document.getElementById('org-arrow');
            
            if (orgCountElement) {
                orgCountElement.textContent = newOrgCount;
            }
            if (orgPercentElement) {
                orgPercentElement.textContent = `${orgChange.value}%`;
                orgPercentElement.className = `text-sm ${orgChange.increase ? 'text-green-600' : 'text-red-600'}`;
            }
            if (orgArrowElement) {
                orgArrowElement.innerHTML = orgChange.increase ? 
                    `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                    </svg>` :
                    `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>`;
                orgArrowElement.className = `${orgChange.increase ? 'text-green-600' : 'text-red-600'}`;
            }
            
            previousOrgCount = newOrgCount; // Update previous count after displaying
        }

        // Update owners count from API data
        const ownersResponse = await fetch(API_URLS.getOrgOwnerList, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "dummy": null })
        });

        const ownersData = await ownersResponse.json();
        const newOwnersCount = Array.isArray(ownersData) ? ownersData.length : 0;
        const ownersChange = calculatePercentageChange(previousOwnerCount, newOwnersCount);
        
        // Update owners count and percentage
        const ownerCountElement = document.getElementById('active-owners');
        const ownerPercentElement = document.getElementById('owner-percent');
        const ownerArrowElement = document.getElementById('owner-arrow');
        
        if (ownerCountElement) {
            ownerCountElement.textContent = newOwnersCount;
        }
        if (ownerPercentElement) {
            ownerPercentElement.textContent = `${ownersChange.value}%`;
            ownerPercentElement.className = `text-sm ${ownersChange.increase ? 'text-green-600' : 'text-red-600'}`;
        }
        if (ownerArrowElement) {
            ownerArrowElement.innerHTML = ownersChange.increase ?
                `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                </svg>` :
                `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>`;
            ownerArrowElement.className = `${ownersChange.increase ? 'text-green-600' : 'text-red-600'}`;
        }
        
        previousOwnerCount = newOwnersCount; // Update previous count after displaying

    } catch (error) {
        console.error('Error updating dashboard stats:', error);
    }
}

// Call updateDashboardStats periodically to keep values updated
setInterval(updateDashboardStats, 30000); // Update every 30 seconds

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Show loading toasts in sequence
    showToast('Loading dashboard data...', toastTypes.INFO);
    setTimeout(() => {
        showToast('Loading owner data...', toastTypes.INFO);
    }, 300);

    updateDashboardStats();
    updateProfileSection();
    refreshUserDetails();
    fetchOwnersData();

    const modal = document.getElementById('add-owner-modal');
    const closeBtn = document.getElementById('close-owner-modal-btn');
    const form = document.getElementById('add-owner-form');
    console.log('Form found:', form); // Debug: Check if form is found
    
    function closeAddOwnerModal() {
        if (modal) {
            modal.classList.add('hidden');
            if (form) form.reset();
        }
    }

    // Event Listeners
    document.querySelector('#owners-table tbody').addEventListener('click', (e) => {
        const userId = e.target.getAttribute('data-id');
        if (e.target.classList.contains('edit-btn') && userId) {
            window.alert(`Edit user id: ${userId}`);
        }
        if (e.target.classList.contains('delete-btn') && userId) {
            window.alert(`Delete user id: ${userId}`);
        }
    });

    // Modal event listeners
    document.querySelector('#btn-add-owner').addEventListener('click', () => {
        modal.classList.remove('hidden');
    });

    closeBtn?.addEventListener('click', closeAddOwnerModal);

    modal?.addEventListener('click', (e) => {
        if (e.target === modal) closeAddOwnerModal();
    });

    // Form submission
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Form submitted'); // Debug: Form submission triggered
        
        const submitButton = e.target.querySelector('button[type="submit"]');
        
        try {
            showLoading(submitButton);
            const ownerData = {
                userEmail: document.getElementById('owner-email').value,
                password: document.getElementById('owner-password').value,
                userRole: "Owner",
                userName: document.getElementById('owner-name').value,
                userMobile1: document.getElementById('owner-mobile1').value,
                userMobile2: document.getElementById('owner-mobile2')?.value || "",
                userGender: document.getElementById('owner-gender').value,
                userAddress: document.getElementById('owner-address').value
            };
            
            console.log('Owner Data:', ownerData); // Debug: Check form data
            console.log('API URL:', API_URLS.createUser); // Debug: Check API URL

            const response = await fetch(API_URLS.createUser, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(ownerData)
            });

            console.log('API Response:', response); // Debug: Check API response
            
            const result = await response.json();
            console.log('API Result:', result); // Debug: Check parsed response

            if (response.ok && result.status === 'success') {
                console.log('Owner created successfully'); // Debug: Success path
                // Close the modal
                document.getElementById('add-owner-modal').classList.add('hidden');
                // Clear the form
                form.reset();
                // Show success message
                showToast(result.message, toastTypes.SUCCESS);
                // Refresh the owners table
                await Promise.all([fetchOwnersData(), updateDashboardStats()]); // Update both table and stats
            } else {
                throw new Error(result.message || 'Failed to add owner');
            }
        } catch (error) {
            console.error('Error creating owner:', error); // Debug: Log any errors
            showToast('Error: ' + error.message, toastTypes.ERROR);
        } finally {
            hideLoading(submitButton);
        }
    });

    // Initialize data
    fetchOwnersData();

    // Add search functionality
    const searchInput = document.getElementById('owner-search');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const tableRows = document.querySelectorAll('#owners-table tbody tr:not(#no-results)');
            const noResults = document.getElementById('no-results');
            let hasResults = false;
            
            tableRows.forEach(row => {
                const ownerName = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
                if (ownerName.includes(searchTerm)) {
                    row.style.display = '';
                    hasResults = true;
                } else {
                    row.style.display = 'none';
                }
            });

            // Show/hide no results message
            if (!hasResults && searchTerm !== '') {
                noResults.classList.remove('hidden');
                showToast('No owners found matching your search', toastTypes.INFO);
            } else {
                noResults.classList.add('hidden');
            }
        });
    }

    // Initialize visual feedback
    addVisualFeedback();

    // Add logout button event listener
    const logoutButton = document.querySelector('#logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
});

// Add this animation function
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

// Update fetchOwnersData to show mobile number instead of password
async function fetchOwnersData() {
    try {
        const response = await fetch(API_URLS.getOrgOwnerList, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "dummy": null
            })
        });
        
        const data = await response.json();
        const tableBody = document.querySelector('#owners-table tbody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';

        if (data && Array.isArray(data)) {
            data.forEach((owner) => {
                const row = document.createElement('tr');
                row.classList.add('hover:bg-gray-50', 'transition-colors');
                
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${owner.user_id || '-'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${owner.user_name || '-'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${owner.user_email || '-'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${owner.user_mobile_1 || '-'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                        <div class="flex space-x-3">
                            <button data-id="${owner.user_id}" 
                                    class="edit-btn text-indigo-600 hover:text-indigo-900 transition-colors">
                                <i class='bx bx-edit-alt text-xl'></i>
                            </button>
                            <button data-id="${owner.user_id}" 
                                    class="delete-btn text-red-600 hover:text-red-900 transition-colors">
                                <i class='bx bx-trash text-xl'></i>
                            </button>
                        </div>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        }

        // Update dashboard stats after fetching owners
        updateDashboardStats();
        
    } catch (error) {
        showToast('Error loading owners data: ' + error.message, toastTypes.ERROR);
    }
}

// Check if token is available
console.log('Token available:', !!token); // Debug: Check token

// Add this function to handle password visibility toggle
function setupPasswordToggle() {
    const passwordInput = document.getElementById('owner-password');
    const currentType = passwordInput.getAttribute('type');
    
    // Create and insert the eye icon button
    const toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.className = 'absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none';
    toggleButton.innerHTML = `
        <i class='bx bx-hide text-xl password-toggle-icon'></i>
    `;

    // Wrap password input in a relative div for proper positioning
    const wrapper = document.createElement('div');
    wrapper.className = 'relative';
    passwordInput.parentNode.insertBefore(wrapper, passwordInput);
    wrapper.appendChild(passwordInput);
    wrapper.appendChild(toggleButton);

    // Add click event to toggle password visibility
    toggleButton.addEventListener('click', function() {
        const icon = this.querySelector('.password-toggle-icon');
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.remove('bx-hide');
            icon.classList.add('bx-show');
        } else {
            passwordInput.type = 'password';
            icon.classList.remove('bx-show');
            icon.classList.add('bx-hide');
        }
    });
}

// Call this function when the modal is opened
document.getElementById('btn-add-owner')?.addEventListener('click', function() {
    const modal = document.getElementById('add-owner-modal');
    if (modal) {
        modal.classList.remove('hidden');
        setupPasswordToggle(); // Setup password toggle when modal opens
    }
});
