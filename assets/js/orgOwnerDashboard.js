const currentYear = new Date().getFullYear(); // Get the current year
const yearInput = document.getElementById('organization-reg-year');
yearInput.max = currentYear; // Set the max value dynamically to the current year
const token = getSessionToken();
// Fetch data when the page loads
fetchOrganizationsData();

var adminAddOrgId = null;

// Set the max value of the registration year input dynamically
document.addEventListener('DOMContentLoaded', () => {
    const currentYear = new Date().getFullYear(); // Get the current year
    document.getElementById('organization-reg-year').max = currentYear;
});


async function fetchOrganizationsData() {
    fetchNotApprovedPcList();
    const url = API_URLS.getOrgList;
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

    document.getElementById('active-organizations').textContent = data.length;

    // Populate the table
    const tableBody = document.querySelector('#organization-table tbody');
    tableBody.innerHTML = ''; // Clear the existing table data

    data.forEach(org => {
        const row = document.createElement('tr');
        row.classList.add('text-sm', 'text-gray-700');

        row.innerHTML = `
            <td class="px-6 py-3">${org.orgName}</td>
            <td class="px-6 py-3">${org.orgAddress}</td>
            <td class="px-6 py-3">${org.registeredYear}</td>
            <td class="px-6 py-3">${org.orgAdminName ? org.orgAdminName : `<button class="add-admin-btn px-4 py-2 bg-blue-600 text-white rounded-lg" data-id="${org.orgId}">Add Admin</button>`}</td>
            <td class="px-6 py-3 text-right">
                <button class="edit-btn px-4 py-2 bg-blue-600 text-white rounded-lg" data-id="${org.orgId}">Edit</button>
                <button class="delete-btn px-4 py-2 bg-red-600 text-white rounded-lg" data-id="${org.orgId}">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
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