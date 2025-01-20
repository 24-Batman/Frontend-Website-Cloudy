// Global variables
const token = getSessionToken();
let meterData = [];
let currentPage = 1;
let pageSize = 10;
let globalMeterId = null;

// Constants
const PAGE_SIZE = 10; // Items per page for pagination

// DOM Elements
const DOM = {
    tableBody: () => document.querySelector('#meter-table tbody'),
    modal: () => document.getElementById('meter-modal'),
    overlay: () => document.getElementById('overlay'),
    closeModalBtn: () => document.getElementById('close-modal-btn'),
    paginationInfo: () => document.getElementById('modal-pagination-info'),
    paginationContainer: () => document.getElementById('modal-pagination'),
    pcSelectBtn: () => document.getElementById('pc-select-btn'),
    pcOptionsPanel: () => document.getElementById('pc-options-panel'),
    pcOptionsList: () => document.getElementById('pc-options-list'),
    selectedPcText: () => document.getElementById('selected-pc')
};

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

// Toast notification system
const toastTypes = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
};

function showToast(message, type = toastTypes.INFO) {
    const toast = document.createElement('div');
    toast.className = `fixed right-4 p-4 rounded-lg text-white ${
        type === toastTypes.SUCCESS ? 'bg-green-500' :
        type === toastTypes.ERROR ? 'bg-red-500' :
        type === toastTypes.WARNING ? 'bg-yellow-500' : 'bg-blue-500'
    } transition-all duration-300 ease-in-out z-50`;
    
    toast.style.top = '1rem';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Initialize when document loads
document.addEventListener('DOMContentLoaded', async () => {
    await fetchMeterList();
    setupEventListeners();
    setupPcSelector();
});

async function fetchMeterList() {
    try {
        const response = await fetch(API_URLS.getMeterList, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ dummy: null })
        });

        const data = await response.json();
        console.log('API Response:', data); // For debugging
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch meter list');
        }

        updateMeterTable(data);
        updateDashboardStats(data);

    } catch (error) {
        console.error('Error fetching meter list:', error);
        showToast('Error loading meter data', toastTypes.ERROR);
        showNoMetersMessage();
    }
}

function updateMeterTable(data) {
    const tableBody = document.querySelector('#meter-table tbody');
    if (!tableBody) return;

    // Clear existing rows
    tableBody.innerHTML = '';

    // Check if meter list exists and has items
    if (!data.meterList || data.meterList.length === 0) {
        showNoMetersMessage();
        return;
    }

    // Update table with meter data
    data.meterList.forEach(meter => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 transition-colors';
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${meter.meterNum || 'N/A'}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${meter.meterName }</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${meter.make }</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${meter.kwAvg }</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${meter.nRec }</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    meter.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }">
                    ${meter.isActive ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button class="text-indigo-600 hover:text-indigo-900" onclick="viewMeterDetails('${meter.meterId}')">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function updateDashboardStats(data) {
    // Update organization name
    const orgNameLabel = document.getElementById('org-name-label');
    if (orgNameLabel) {
        orgNameLabel.textContent = data.orgName || 'N/A';
    }

    // Update total meters count
    const totalMetersElement = document.getElementById('total-meters-count');
    if (totalMetersElement) {
        totalMetersElement.textContent = data.meterList?.length || '0';
    }

    // Update current site name
    const activeSitesElement = document.getElementById('active-sites');
    if (activeSitesElement) {
        activeSitesElement.textContent = data.siteName || 'N/A';
    }
}

function showNoMetersMessage() {
    const tableBody = document.querySelector('#meter-table tbody');
    if (!tableBody) return;

    tableBody.innerHTML = `
        <tr>
            <td colspan="7" class="px-6 py-12 text-center">
                <div class="flex flex-col items-center justify-center space-y-3">
                    <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p class="text-gray-500 text-lg font-medium">No meters available yet</p>
                    <p class="text-gray-400 text-sm">Meters will appear here once they are added to the system</p>
                </div>
            </td>
        </tr>
    `;
}

function setupEventListeners() {
    // Search functionality
    const searchInput = document.querySelector('input[type="text"]');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            const rows = document.querySelectorAll('#meter-table tbody tr');
            
            rows.forEach(row => {
                const meterName = row.querySelector('td:nth-child(2)')?.textContent.toLowerCase();
                row.style.display = meterName?.includes(query) ? '' : 'none';
            });
        });
    }

    // Add click event listener to the meter table
    document.querySelector('#meter-table tbody').addEventListener('click', async (e) => {
        const row = e.target.closest('tr');
        if (row) {
            const meterId = row.getAttribute('data-meter-id');
            if (meterId) {
                globalMeterId = meterId;
                const meterName = row.querySelector('td:nth-child(2)').textContent.trim();
                
                // Update modal header
                document.getElementById('modal-meter-num').textContent = `Meter Num: ${meterId}`;
                document.getElementById('modal-meter-name').textContent = `Meter Name: ${meterName}`;
                
                // Show modal
                document.getElementById('meter-modal').classList.remove('hidden');
                
                // Generate and display sample data
                meterData = generateSampleData();
                renderTable(1);
                setupPagination();
            }
        }
    });

    // Add event listener for rows per page change
    document.getElementById('rows-per-page').addEventListener('change', function() {
        pageSize = parseInt(this.value);
        currentPage = 1;
        renderTable(currentPage);
        setupPagination();
    });

    // Add event listener for modal close button
    document.getElementById('close-meter-modal-btn').addEventListener('click', () => {
        document.getElementById('meter-modal').classList.add('hidden');
        globalMeterId = null;
    });

    // Add event listener for filter button
    document.getElementById('filter-btn')?.addEventListener('click', () => {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        const timeRange = document.getElementById('time-range').value;
        fetchMeterData(startDate, endDate, timeRange);
    });

    // Add filter button event listener
    document.querySelector('button:has(i.bx-filter)').addEventListener('click', async () => {
        const filterBtn = document.querySelector('button:has(i.bx-filter)');
        const startDate = document.getElementById('start-date').value;
        const timeRange = document.getElementById('time-range').value;

        // Validate that at least one filter is selected
        if (!startDate && timeRange === 'none') {
            alert('Please select either a specific date or a time range');
            return;
        }

        // Show loading state
        filterBtn.disabled = true;
        filterBtn.innerHTML = `
            <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Filtering...
        `;

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Filter the data
            const filteredData = filterData(startDate, timeRange);
            meterData = filteredData;
            currentPage = 1;
            
            // Update the table and pagination
            renderTable(currentPage);
            setupPagination();

            // Show success message
            const toast = document.createElement('div');
            toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transition-opacity duration-500';
            toast.textContent = 'Data filtered successfully!';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);

        } catch (error) {
            console.error('Filter failed:', error);
            alert('Failed to filter data. Please try again.');
        } finally {
            // Reset button state
            filterBtn.disabled = false;
            filterBtn.innerHTML = `
                <i class='bx bx-filter'></i>
                Apply Filter
            `;
        }
    });

    // Add export button event listener
    document.querySelector('button:has(i.bx-export)').addEventListener('click', async () => {
        const exportBtn = document.querySelector('button:has(i.bx-export)');
        
        // Show loading state
        exportBtn.disabled = true;
        exportBtn.innerHTML = `
            <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Exporting...
        `;

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Export the data
            exportTableData();

            // Show success message
            const toast = document.createElement('div');
            toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transition-opacity duration-500';
            toast.textContent = 'Data exported successfully!';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);

        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export data. Please try again.');
        } finally {
            // Reset button state
            exportBtn.disabled = false;
            exportBtn.innerHTML = `
                <i class='bx bx-export'></i>
                Export Data
            `;
        }
    });

    // Add close button event listener
    document.getElementById('close-modal-btn')?.addEventListener('click', closeMeterModal);
    
    // Add close on overlay click
    document.getElementById('overlay')?.addEventListener('click', closeMeterModal);
    
    // Add escape key listener
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMeterModal();
        }
    });
}

function generateSampleData() {
    const data = [];
    const baseDate = new Date();
    
    for(let i = 0; i < 100; i++) {
        const timestamp = new Date(baseDate.getTime() - (i * 15 * 60000)); // 15-minute intervals backwards
        const variation = () => (Math.random() * 0.1) - 0.05; // ±5% variation
        
        data.push({
            dataCount: 1001 + i,
            timeStamp: timestamp.toISOString().replace('T', ' ').substring(0, 19),
            v12: (415 + (415 * variation())).toFixed(1),
            v23: (414 + (414 * variation())).toFixed(1),
            v31: (415 + (415 * variation())).toFixed(1),
            i1: (45 + (45 * variation())).toFixed(1),
            i2: (46 + (46 * variation())).toFixed(1),
            i3: (45 + (45 * variation())).toFixed(1),
            kw: (32 + (32 * variation())).toFixed(1),
            kva: (35 + (35 * variation())).toFixed(1),
            kvar: (12 + (12 * variation())).toFixed(1),
            pf: (0.92 + (variation() * 0.02)).toFixed(2),
            hz: (50 + (variation() * 0.2)).toFixed(1),
            kwh: (1250 + (i * 2.5)).toFixed(1),
            kvah: (1358 + (i * 2.7)).toFixed(1),
            pFlag: Math.random() > 0.95 ? "Warning" : "Normal",
            lFlag: Math.random() > 0.95 ? "Alert" : "Normal"
        });
    }
    return data;
}

function renderTable(page) {
    const start = (page - 1) * pageSize;
    const end = Math.min(start + pageSize, meterData.length);
    const paginatedData = meterData.slice(start, end);

    const tableBody = document.querySelector('#modal-meter-table tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';

    paginatedData.forEach((meter, index) => {
        const row = document.createElement('tr');
        row.classList.add(
            'hover:bg-gray-50/90', 
            'transition-all', 
            'duration-200',
            'border-b',
            'border-gray-200',
            index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
        );
        
        const isPFlagWarning = meter.pFlag !== "Normal";
        const isLFlagWarning = meter.lFlag !== "Normal";
        
        row.innerHTML = `
            <td class="px-4 py-3.5 text-sm font-medium text-gray-900">${start + index + 1}</td>
            <td class="px-4 py-3.5 text-sm text-gray-600 font-medium">${meter.dataCount}</td>
            <td class="px-4 py-3.5 text-sm text-gray-600">
                <div class="flex items-center">
                    <i class='bx bx-time-five mr-1.5 text-gray-400'></i>
                    ${meter.timeStamp}
                </div>
            </td>
            <td class="px-4 py-3.5 text-sm font-mono text-gray-600 tabular-nums">${meter.v12}</td>
            <td class="px-4 py-3.5 text-sm font-mono text-gray-600 tabular-nums">${meter.v23}</td>
            <td class="px-4 py-3.5 text-sm font-mono text-gray-600 tabular-nums">${meter.v31}</td>
            <td class="px-4 py-3.5 text-sm font-mono text-gray-600 tabular-nums">${meter.i1}</td>
            <td class="px-4 py-3.5 text-sm font-mono text-gray-600 tabular-nums">${meter.i2}</td>
            <td class="px-4 py-3.5 text-sm font-mono text-gray-600 tabular-nums">${meter.i3}</td>
            <td class="px-4 py-3.5 text-sm font-mono text-gray-600 tabular-nums font-medium">${meter.kw}</td>
            <td class="px-4 py-3.5 text-sm font-mono text-gray-600 tabular-nums font-medium">${meter.kva}</td>
            <td class="px-4 py-3.5 text-sm font-mono text-gray-600 tabular-nums">${meter.kvar}</td>
            <td class="px-4 py-3.5 text-sm font-mono text-gray-600 tabular-nums">${meter.pf}</td>
            <td class="px-4 py-3.5 text-sm font-mono text-gray-600 tabular-nums">${meter.hz}</td>
            <td class="px-4 py-3.5 text-sm font-mono text-gray-600 tabular-nums font-medium">${meter.kwh}</td>
            <td class="px-4 py-3.5 text-sm font-mono text-gray-600 tabular-nums font-medium">${meter.kvah}</td>
            <td class="px-4 py-3.5 text-sm">
                <span class="px-2.5 py-1 text-xs font-medium rounded-full inline-flex items-center gap-1 ${
                    isPFlagWarning 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                }">
                    <span class="w-1.5 h-1.5 rounded-full ${
                        isPFlagWarning ? 'bg-red-600' : 'bg-green-600'
                    }"></span>
                    ${meter.pFlag}
                </span>
            </td>
            <td class="px-4 py-3.5 text-sm">
                <span class="px-2.5 py-1 text-xs font-medium rounded-full inline-flex items-center gap-1 ${
                    isLFlagWarning 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                }">
                    <span class="w-1.5 h-1.5 rounded-full ${
                        isLFlagWarning ? 'bg-red-600' : 'bg-green-600'
                    }"></span>
                    ${meter.lFlag}
                </span>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Enhanced pagination info with better styling
    const paginationInfo = document.getElementById('modal-pagination-info');
    if (paginationInfo) {
        paginationInfo.innerHTML = `
            <div class="text-sm text-gray-700">
                Showing <span class="font-medium text-gray-900">${start + 1}</span> to 
                <span class="font-medium text-gray-900">${end}</span> of 
                <span class="font-medium text-gray-900">${meterData.length}</span> entries
            </div>
        `;
    }
}

function setupPagination() {
    const totalPages = Math.ceil(meterData.length / pageSize);
    const paginationContainer = document.getElementById('modal-pagination');
    paginationContainer.innerHTML = '';

    // Create pagination with ellipsis
    const renderPageNumbers = () => {
        const pageNumbers = [];
        
        if (totalPages <= 7) {
            // If 7 or fewer pages, show all
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            // Always show first page
            pageNumbers.push(1);
            
            if (currentPage > 3) {
                pageNumbers.push('...');
            }
            
            // Show pages around current page
            for (let i = Math.max(2, currentPage - 1); i <= Math.min(currentPage + 1, totalPages - 1); i++) {
                pageNumbers.push(i);
            }
            
            if (currentPage < totalPages - 2) {
                pageNumbers.push('...');
            }
            
            // Always show last page
            pageNumbers.push(totalPages);
        }
        
        return pageNumbers;
    };

    // Enhanced pagination controls
    const createPageButton = (text, isPage = true, isActive = false, isDisabled = false) => {
        const button = document.createElement('button');
        button.innerHTML = text;
        button.classList.add(
            'inline-flex',
            'items-center',
            'justify-center',
            'px-3.5',
            'py-2',
            'text-sm',
            'font-medium',
            'transition-all',
            'duration-200',
            'border',
            'min-w-[40px]',
            'focus:z-10',
            'focus:outline-none',
            'focus:ring-2',
            'focus:ring-indigo-500',
            'focus:ring-offset-1'
        );

        if (isDisabled) {
            button.classList.add('text-gray-300', 'cursor-not-allowed', 'bg-gray-50', 'border-gray-200');
        } else if (isActive) {
            button.classList.add('z-10', 'bg-indigo-600', 'text-white', 'border-indigo-600', 'hover:bg-indigo-700');
        } else {
            button.classList.add(
                'text-gray-500',
                'bg-white',
                'border-gray-300',
                'hover:bg-gray-50',
                'hover:text-gray-700'
            );
        }

        return button;
    };

    // Previous button
    const prevButton = createPageButton(
        '<i class="bx bx-chevron-left text-lg"></i>',
        false,
        false,
        currentPage === 1
    );
    prevButton.classList.add('rounded-l-lg');
    if (currentPage > 1) {
        prevButton.addEventListener('click', () => {
            currentPage--;
            renderTable(currentPage);
            setupPagination();
        });
    }
    paginationContainer.appendChild(prevButton);

    // Page numbers with ellipsis
    renderPageNumbers().forEach(pageNum => {
        if (pageNum === '...') {
            const ellipsis = document.createElement('span');
            ellipsis.innerHTML = '...';
            ellipsis.classList.add(
                'px-3.5',
                'py-2',
                'text-gray-500',
                'select-none'
            );
            paginationContainer.appendChild(ellipsis);
        } else {
            const button = createPageButton(pageNum, true, pageNum === currentPage);
            button.addEventListener('click', () => {
                currentPage = pageNum;
                renderTable(currentPage);
                setupPagination();
            });
            paginationContainer.appendChild(button);
        }
    });

    // Next button
    const nextButton = createPageButton(
        '<i class="bx bx-chevron-right text-lg"></i>',
        false,
        false,
        currentPage === totalPages
    );
    nextButton.classList.add('rounded-r-lg');
    if (currentPage < totalPages) {
        nextButton.addEventListener('click', () => {
            currentPage++;
            renderTable(currentPage);
            setupPagination();
        });
    }
    paginationContainer.appendChild(nextButton);
}

// Function to handle date filtering
function filterData(startDate, timeRange) {
    let filteredData = [...meterData]; // Create a copy of the original data
    
    if (startDate) {
        // If specific date is selected, filter by that date only
        const selectedDate = new Date(startDate);
        filteredData = meterData.filter(item => {
            const itemDate = new Date(item.timeStamp);
            return itemDate.toDateString() === selectedDate.toDateString();
        });
    } else if (timeRange !== 'none') {
        // If time range is selected (and not 'none'), filter by range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - parseInt(timeRange));
        
        filteredData = meterData.filter(item => {
            const itemDate = new Date(item.timeStamp);
            return itemDate >= startDate && itemDate <= endDate;
        });
    }

    return filteredData;
}

// Function to export data to CSV
function exportTableData() {
    try {
        // Define headers
        const headers = [
            'S.No', 'Data Count', 'Time Stamp', 'V12', 'V23', 'V31',
            'I1', 'I2', 'I3', 'Kw', 'Kva', 'Kvar', 'Pf', 'Hz',
            'Kwh', 'Kvah', 'P Flag', 'L Flag'
        ];

        // Create CSV content
        let csvContent = headers.join(',') + '\n';

        // Add data rows
        meterData.forEach((item, index) => {
            const row = [
                index + 1,
                item.dataCount,
                item.timeStamp,
                item.v12,
                item.v23,
                item.v31,
                item.i1,
                item.i2,
                item.i3,
                item.kw,
                item.kva,
                item.kvar,
                item.pf,
                item.hz,
                item.kwh,
                item.kvah,
                item.pFlag,
                item.lFlag
            ];
            csvContent += row.join(',') + '\n';
        });

        // Create and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `meter_data_${globalMeterId}_${new Date().toISOString().slice(0,10)}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Export failed:', error);
        alert('Failed to export data. Please try again.');
    }
}

function setupPcSelector() {
    const selectBtn = document.getElementById('pc-select-btn');
    const optionsPanel = document.getElementById('pc-options-panel');
    const optionsList = document.getElementById('pc-options-list');
    const selectedPcText = document.getElementById('selected-pc');
    const arrow = selectBtn?.querySelector('svg');
    
    // Generate PC options
    const pcCount = 12; // Can be dynamic based on your data
    if (optionsList) {
        for (let i = 1; i <= pcCount; i++) {
            const option = document.createElement('button');
            option.className = `w-full px-4 py-2 text-left text-gray-700 hover:bg-indigo-50 rounded-md flex items-center justify-between group transition-colors ${i === 1 ? 'bg-indigo-50' : ''}`;
            option.innerHTML = `
                <span class="font-medium">PC ${i}</span>
                <svg class="w-5 h-5 text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" 
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
            `;
            
            option.addEventListener('click', () => {
                selectedPcText.textContent = `PC ${i}`;
                togglePanel(false);
                handlePcSelection(i);
                
                // Update active state
                optionsList.querySelectorAll('button').forEach(btn => {
                    btn.classList.remove('bg-indigo-50');
                });
                option.classList.add('bg-indigo-50');
            });
            
            optionsList.appendChild(option);
        }
    }

    // Toggle panel visibility
    function togglePanel(show) {
        if (show === undefined) {
            show = optionsPanel?.classList.contains('hidden');
        }
        
        optionsPanel?.classList.toggle('hidden', !show);
        arrow?.style.setProperty('transform', show ? 'rotate(180deg)' : 'rotate(0)');
    }

    // Event listeners
    selectBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePanel();
    });

    // Close panel when clicking outside
    document.addEventListener('click', () => {
        togglePanel(false);
    });

    // Prevent panel close when clicking inside
    optionsPanel?.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Add keyboard navigation
    selectBtn?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            togglePanel();
        }
    });
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
function handlePcSelection(pcNumber) {
    console.log(`Selected PC ${pcNumber}`);
    // Add your PC selection logic here
    // This might include fetching new data, updating UI, etc.
}

// Add this function to handle meter view
function viewMeterDetails(meterId) {
    const modal = document.getElementById('meter-modal');
    const overlay = document.getElementById('overlay');
    
    if (!modal || !overlay) return;

    // Store the meter ID globally for use in modal
    globalMeterId = meterId;
    
    // Reset page to 1 when opening modal
    currentPage = 1;
    
    // Fetch and display meter data
    fetchMeterData(meterId);
    
    // Show modal and overlay
    modal.classList.remove('hidden');
    overlay.classList.remove('hidden');
    
    // Initialize pagination
    setupPagination();
}

// Add function to fetch meter data
async function fetchMeterData(meterId) {
    try {
        const response = await fetch(API_URLS.getMeterData, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ meterId: meterId })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch meter data');
        }

        // Store meter data globally
        meterData = data;
        
        // Render the first page of data
        renderTable(currentPage);

    } catch (error) {
        console.error('Error fetching meter data:', error);
        showToast('Error loading meter data', toastTypes.ERROR);
    }
}

// Add close modal function
function closeMeterModal() {
    const modal = document.getElementById('meter-modal');
    const overlay = document.getElementById('overlay');
    
    if (!modal || !overlay) return;
    
    modal.classList.add('hidden');
    overlay.classList.add('hidden');
    
    // Clear global meter ID
    globalMeterId = null;
    
    // Clear meter data
    meterData = [];
}