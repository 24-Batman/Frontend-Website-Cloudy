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

document.getElementById('add-organization-form').addEventListener('submit', function (event) {
    event.preventDefault();
    // Add your form submission logic here
    alert('Organization added successfully!');
    document.getElementById('add-organization-modal').classList.add('hidden');
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
        card.innerHTML = `
            <div class="flex items-start gap-4">
                <div class="flex-shrink-0 ai-style-change-1">
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
    const pc = pcRequests.find(req => req.id === pcId);
    if (!pc) return;

    const isConfirmed = window.confirm(`Do you want to ${action.toLowerCase()} PC: ${pc.pcName}?`);
    if (isConfirmed) {
        pcRequests = pcRequests.filter(req => req.id !== pcId);
        renderPCRequests();
        updateNotificationCount(); // Update the count after action
        console.log('Notification count after action:', pcRequests.length); // Debugging line
        alert(`PC ${action.toLowerCase()}d successfully!`);

        if (pcRequests.length === 0) {
            closeApprovePC();
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

// Set the max value of the registration year input dynamically
document.addEventListener('DOMContentLoaded', () => {
    const currentYear = new Date().getFullYear(); // Get the current year
    document.getElementById('organization-reg-year').max = currentYear;
    updateNotificationCount();
});


// async function fetchOrganizationsData() {
//     fetchNotApprovedPcList();
//     const url = API_URLS.getOrgList;
//     const requestBody = {
//         dummy: null
//     };
//     const response = await fetch(url, {
//         method: 'POST', // Using POST method
//         headers: {
//             'Authorization': `Bearer ${token}`, // Replace with your actual token
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(requestBody)
//     });

//     const data = await response.json(); // Parse the JSON response

//     document.getElementById('active-organizations').textContent = data.length;

//     // Populate the table
//     const tableBody = document.querySelector('#organization-table tbody');
//     tableBody.innerHTML = ''; // Clear the existing table data

//     data.forEach(org => {
//         const row = document.createElement('tr');
//         row.classList.add('text-sm', 'text-gray-700');

//         row.innerHTML = `
//             <td class="px-6 py-3">${org.orgName}</td>
//             <td class="px-6 py-3">${org.orgAddress}</td>
//             <td class="px-6 py-3">${org.registeredYear}</td>
//             <td class="px-6 py-3">${org.orgAdminName ? org.orgAdminName : `<button class="add-admin-btn px-4 py-2 bg-blue-600 text-white rounded-lg" data-id="${org.orgId}">Add Admin</button>`}</td>
//             <td class="px-6 py-3 text-right">
//                 <button class="edit-btn px-4 py-2 bg-blue-600 text-white rounded-lg" data-id="${org.orgId}">Edit</button>
//                 <button class="delete-btn px-4 py-2 bg-red-600 text-white rounded-lg" data-id="${org.orgId}">Delete</button>
//             </td>
//         `;
//         tableBody.appendChild(row);
//     });
// }


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