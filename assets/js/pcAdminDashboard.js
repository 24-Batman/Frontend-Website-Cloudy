const token = getSessionToken();
// Fetch data when the page loads
fetchMeter();

var globalMeterId = null;
var globalPcId = null;

async function fetchMeter() {
    const url = API_URLS.getMeterList;
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

    document.getElementById('active-meters').textContent = data.meterList.length;
    document.getElementById('org-name-lable').textContent = `Organization: ${data.orgName}`;
    document.getElementById('site-name-lable').textContent = `site: ${data.siteName}`;
    document.getElementById('pc-name-lable').textContent = `Pc: ${data.pcName}`;

    // Populate the table
    let sortOrder = 'asc'; // Initially set the sort order to ascending

    // Function to sort data based on the selected column
    function sortTable(column, order) {
        const tableBody = document.querySelector('#meter-table tbody');
        const rows = Array.from(tableBody.rows);

        rows.sort((a, b) => {
            const aText = a.querySelector(`td:nth-child(${column})`).textContent.trim();
            const bText = b.querySelector(`td:nth-child(${column})`).textContent.trim();

            // Parse numbers for columns that have numeric values
            const aValue = isNaN(aText) ? aText : parseFloat(aText);
            const bValue = isNaN(bText) ? bText : parseFloat(bText);

            if (aValue < bValue) {
                return order === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return order === 'asc' ? 1 : -1;
            }
            return 0;
        });

        // Append sorted rows back to the table body
        rows.forEach(row => tableBody.appendChild(row));
    }

    // Event listener for table headers
    document.querySelectorAll('#meter-table th').forEach(header => {
        header.addEventListener('click', () => {
            const column = header.getAttribute('data-column');
            if (column) {
                // Toggle sort order
                sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
                const columnIndex = Array.from(header.parentElement.children).indexOf(header) + 1;
                sortTable(columnIndex, sortOrder);
            }
        });
    });

    // Populate the table (using your existing code)
    const tableBody = document.querySelector('#meter-table tbody');
    tableBody.innerHTML = ''; // Clear the existing table data
    globalPcId = data.pcId;
    data.meterList.forEach(meter => {
        if (meter.meterId != null) {
            const row = document.createElement('tr');
            row.classList.add('text-sm', 'text-gray-700');
            row.innerHTML = `
                <td class="px-6 py-3">${meter.meterNum}</td>
                <td class="px-6 py-3">${meter.meterName}</td>
                <td class="px-6 py-3">${meter.make}</td>
                <td class="px-6 py-3">${meter.kwAvg}</td>
                <td class="px-6 py-3">${meter.nRec}</td>
                <td class="px-6 py-3">${meter.meterHealthStatus === "Good" ? `<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Good</span>` : `<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Check</span>`}</td>
                <td class="px-6 py-3 text-right">
                    <button class="analytics-btn px-4 py-2 bg-blue-600 text-white rounded-lg" data-id="${meter.meterId}">
                    <i class='bx bx-line-chart text-xl'></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        } else {
            document.getElementById('active-meters').textContent = 0;
        }
    });
}

// Use event delegation to handle "Analytics" button clicks
document.querySelector('#meter-table tbody').addEventListener('click', (e) => {
    // Find the closest button element with the class 'analytics-btn' (handles clicks on both the button and the icon)
    const button = e.target.closest('.analytics-btn');
    if (button) {
        const meterId = button.getAttribute('data-id');
        if (meterId) {
            globalMeterId = meterId;
            window.alert(`pc id: ${globalPcId}, meter id: ${globalMeterId}`);
            document.getElementById('meter-modal').classList.remove('hidden');
            const startDate = null;
            const endDate = null;
            const timeRange = 1;
            fetchMeterData(startDate, endDate, timeRange);
        } else {
            console.error('meterId is undefined');
        }
    }
});

// Close the modal when the "Cancel" button is clicked
document.getElementById('close-meter-modal-btn').addEventListener('click', () => {
    document.getElementById('meter-modal').classList.add('hidden');
    globalMeterId = null;
});

//Meter data model process
let meterData = []; // Store all the fetched data
let currentPage = 1;
const pageSize = 100;

// Fetch Meter Data based on date and time range filters
async function fetchMeterData(startDate, endDate, timeRange) {
    const url = API_URLS.getMeterData; // replace with your API
    const requestBody = {
        pcId: globalPcId,
        meterId: globalMeterId,
        startDate: startDate,
        endDate: endDate,
        timeRange: timeRange
    };

    // Print all in one alert
    window.alert(
        `pcId: ${requestBody.pcId}\n` +
        `meterId: ${requestBody.meterId}\n` +
        `startDate: ${requestBody.startDate}\n` +
        `endDate: ${requestBody.endDate}\n` +
        `timeRange: ${requestBody.timeRange}`
    );

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`, // replace with actual token
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });

    meterData = await response.json(); // Assume meterData is returned in JSON format
    renderTable(currentPage); // Render the first page of data
    setupPagination();
}

function renderTable(page) {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedData = meterData.slice(start, end);

    // Change tableBody to target the modal's table
    const tableBody = document.querySelector('#modal-meter-table tbody');
    tableBody.innerHTML = ''; // Clear previous rows

    paginatedData.forEach((meter, index) => {
        const row = document.createElement('tr');
        row.classList.add('text-sm', 'text-gray-700');
        row.innerHTML = `
            <td class="px-6 py-3">${start + index + 1}</td>
            <td class="px-6 py-3">${meter.dataCount}</td>
            <td class="px-6 py-3">${meter.timeStamp}</td>
            <td class="px-6 py-3">${meter.v12}</td>
            <td class="px-6 py-3">${meter.v23}</td>
            <td class="px-6 py-3">${meter.v31}</td>
            <td class="px-6 py-3">${meter.i1}</td>
            <td class="px-6 py-3">${meter.i2}</td>
            <td class="px-6 py-3">${meter.i3}</td>
            <td class="px-6 py-3">${meter.kw}</td>
            <td class="px-6 py-3">${meter.kva}</td>
            <td class="px-6 py-3">${meter.kvar}</td>
            <td class="px-6 py-3">${meter.pf}</td>
            <td class="px-6 py-3">${meter.hz}</td>
            <td class="px-6 py-3">${meter.kwh}</td>
            <td class="px-6 py-3">${meter.kvah}</td>
            <td class="px-6 py-3">${meter.pFlag}</td>
            <td class="px-6 py-3">${meter.lFlag}</td>
        `;
        tableBody.appendChild(row);
    });

    // Update Pagination Info in modal
    document.getElementById('modal-pagination-info').textContent = `Showing ${start + 1} to ${Math.min(end, meterData.length)} of ${meterData.length} entries`;
}

document.addEventListener('DOMContentLoaded', function () {
    const hamburgerButton = document.getElementById('hamburger-button');
    const drawerNavigation = document.getElementById('drawer-navigation');
    const closeButton = drawerNavigation.querySelector('[data-drawer-hide]');

    // Function to toggle the sidebar
    function toggleSidebar() {
        const isHidden = drawerNavigation.classList.contains('-translate-x-full');
        if (isHidden) {
            drawerNavigation.classList.remove('-translate-x-full');
            hamburgerButton.style.display = 'none';
        } else {
            drawerNavigation.classList.add('-translate-x-full');
            hamburgerButton.style.display = 'block';
        }
    }

    // Add event listener to the hamburger button
    hamburgerButton.addEventListener('click', toggleSidebar);

    // Add event listener to the close button inside the sidebar
    closeButton.addEventListener('click', toggleSidebar);
});
function setupPagination() {
    const totalPages = Math.ceil(meterData.length / pageSize);
    const paginationContainer = document.getElementById('modal-pagination'); // Modal pagination container
    paginationContainer.innerHTML = ''; // Clear previous pagination buttons

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.classList.add('px-3', 'py-1', 'border', 'border-slate-200', 'rounded', 'hover:bg-slate-50');
        if (i === currentPage) {
            button.classList.add('bg-purple-500', 'text-white');
        }

        button.addEventListener('click', () => {
            currentPage = i;
            renderTable(i); // Renders data in modal's table
        });

        paginationContainer.appendChild(button);
    }
}

// Event Listener for Filter Button
document.getElementById('filter-btn').addEventListener('click', () => {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    const timeRange = document.getElementById('time-range').value ? document.getElementById('time-range').value : null;

    fetchMeterData(startDate, endDate, timeRange);
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