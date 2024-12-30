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

// Generate dummy data for owners with simpler structure
function generateDummyOwners(count = 10) {
    const owners = [
        { name: 'Arun', email: 'arun@mail.com', organization: 'Tech Corp' },
        { name: 'Karthik', email: 'karthik@mail.com', organization: 'Mars Industries' },
        { name: 'Priya', email: 'priya@mail.com', organization: 'Cloud Systems' },
        { name: 'Rahul', email: 'rahul@mail.com', organization: 'Data Corp' },
        { name: 'Sneha', email: 'sneha@mail.com', organization: 'AI Solutions' }
    ];

    return Array.from({ length: count }, (_, index) => ({
        id: index + 1,
        ...owners[index % owners.length]
    }));
}

// Modified fetchOwnersData to match the exact table structure
async function fetchOwnersData() {
    try {
        const data = generateDummyOwners(10);
        const tableBody = document.querySelector('#owners-table tbody');
        tableBody.innerHTML = '';

        data.forEach((owner, index) => {
            const row = document.createElement('tr');
            row.classList.add('hover:bg-gray-50', 'transition-colors');
            
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${owner.id}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${owner.name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${owner.email}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${owner.organization}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">********</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <div class="flex space-x-3">
                        <button onclick="handleOwnerAction('${owner.id}', 'edit')" 
                                class="text-indigo-600 hover:text-indigo-900 transition-colors">
                            <i class='bx bx-edit-alt text-xl'></i>
                        </button>
                        <button onclick="handleOwnerAction('${owner.id}', 'delete')" 
                                class="text-red-600 hover:text-red-900 transition-colors">
                            <i class='bx bx-trash text-xl'></i>
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        showToast('Error loading owners data: ' + error.message, toastTypes.ERROR);
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('add-owner-modal');
    const closeBtn = document.getElementById('close-owner-modal-btn');
    const form = document.getElementById('add-owner-form');
    
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

            const response = await fetch(API_URLS.createUser, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(ownerData)
            });

            const result = await response.json();
            if (response.ok && result.status === 'success') {
                closeAddOwnerModal();
                fetchOwnersData();
                showToast(result.message, toastTypes.SUCCESS);
            } else {
                throw new Error(result.message || 'Failed to add owner');
            }
        } catch (error) {
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
});

// Success message
showToast('Owner added successfully!', toastTypes.SUCCESS);

// Error message
showToast('Failed to add owner', toastTypes.ERROR);

// Warning message
showToast('Please fill all required fields', toastTypes.WARNING);

// Info message
showToast('Loading owner data...', toastTypes.INFO);



