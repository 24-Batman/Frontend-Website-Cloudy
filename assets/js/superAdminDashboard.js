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

// Function to fetch and populate owners data
async function fetchOwnersData() {
    try {
        const url = API_URLS.getOrgOwnerList;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ dummy: null })
        });

        const data = await response.json();
        document.getElementById('active-owners').textContent = data.length;

        const tableBody = document.querySelector('#owners-table tbody');
        tableBody.innerHTML = '';

        data.forEach(owner => {
            const row = document.createElement('tr');
            row.classList.add('text-sm', 'text-gray-700');
            row.innerHTML = `
                <td class="px-6 py-3">${owner.user_name}</td>
                <td class="px-6 py-3">${owner.user_email}</td>
                <td class="px-6 py-3">${owner.user_mobile_1}</td>
                <td class="px-6 py-3">${owner.user_address}</td>
                <td class="px-6 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</td>
                <td class="px-6 py-3 text-right">
                    <button class="edit-btn px-4 py-2 bg-blue-600 text-white rounded-lg" data-id="${owner.user_id}">Edit</button>
                    <button class="delete-btn px-4 py-2 bg-red-600 text-white rounded-lg" data-id="${owner.user_id}">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        showToast('Error fetching owners data: ' + error.message, toastTypes.ERROR);
    }
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

        try {
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
        }
    });

    // Initialize data
    fetchOwnersData();

    // Add search functionality
    const searchInput = document.getElementById('owner-search');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const tableRows = document.querySelectorAll('#owners-table tbody tr');
            
            tableRows.forEach(row => {
                const ownerName = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
                if (ownerName.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
});



