// Global variables
const token = getSessionToken();
let meterData = [];
let currentPage = 1;
let pageSize = 10;
let globalMeterId = null;

// Constants
const PAGE_SIZE = 10; // Items per page for pagination

// Constants and Types
const UI_STATE = {
    LOADING: 'loading',
    SUCCESS: 'success',
    ERROR: 'error'
};

// DOM Elements - Centralized selectors
const DOM = {
    tableBody: () => document.querySelector('#meter-table tbody'),
    meterModal: {
        container: () => document.getElementById('meter-modal'),
        table: () => document.getElementById('modal-meter-table'),
        closeBtn: () => document.getElementById('close-meter-modal-btn'),
        pagination: () => document.getElementById('modal-pagination'),
        paginationInfo: () => document.getElementById('modal-pagination-info'),
        overlay: () => document.getElementById('overlay')
    },
    pcSelection: {
        button: () => document.getElementById('pc-select-btn'),
        modal: () => document.getElementById('pc-selection-modal'),
        closeBtn: () => document.getElementById('close-pc-modal'),
        list: () => document.getElementById('pc-options-list'),
        selectedText: () => document.getElementById('selected-pc'),
        searchInput: () => document.getElementById('pc-search')
    }
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
    toast.className = `fixed right-4 top-4 p-4 rounded-lg text-white ${
        type === toastTypes.SUCCESS ? 'bg-green-500' :
        type === toastTypes.ERROR ? 'bg-red-500' :
        type === toastTypes.WARNING ? 'bg-yellow-500' : 'bg-blue-500'
    } transition-all duration-300 ease-in-out z-50`;
    
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add these functions at the top level of the file, after the initial constants
function animateLogout(callback) {
    const logoutBtn = document.querySelector('button[onclick="handleLogout()"]');
    if (!logoutBtn) {
        console.error('Logout button not found');
        return callback();
    }

    logoutBtn.innerHTML = `
        <div class="flex items-center justify-center space-x-2">
            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Logging out...</span>
        </div>
    `;
    logoutBtn.disabled = true;
    setTimeout(callback, 1000);
}

// Make handleLogout globally available
window.handleLogout = function() {
    animateLogout(() => {
        localStorage.clear();
        document.cookie = 'sessionToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        window.location.href = '/login.html';
    });
};

// Initialize when document loads
document.addEventListener('DOMContentLoaded', async () => {
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    try {
        // Initialize controllers
        window.meterModal = new MeterModalController();
        window.pcDropdown = new PCDropdownController();

        // Setup event listeners for meter view buttons
        document.querySelectorAll('[data-meter-id]').forEach(button => {
            button.addEventListener('click', (e) => {
                const meterId = e.currentTarget.dataset.meterId;
                window.meterModal.openModal(meterId);
            });
        });

        // Initial data fetch
        await window.pcDropdown.fetchPCList();
        
        // Initial meter list fetch
        await fetchMeterList();
        
        // Setup event listeners for search and other functionality
        setupEventListeners();

    } catch (error) {
        console.error('Initialization error:', error);
        showToast('Failed to initialize dashboard', toastTypes.ERROR);
    }
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

    // Add event listener for rows per page change
    const rowsPerPageSelect = document.getElementById('rows-per-page');
    if (rowsPerPageSelect) {
        rowsPerPageSelect.addEventListener('change', function() {
            pageSize = parseInt(this.value);
            currentPage = 1;
            if (window.meterModal) {
                window.meterModal.renderTable(currentPage);
                window.meterModal.setupPagination();
            }
        });
    }

    // Add event listener for filter button
    const filterBtn = document.querySelector('button:has(i.bx-filter)');
    if (filterBtn) {
        filterBtn.addEventListener('click', async () => {
            const startDate = document.getElementById('start-date')?.value;
            const timeRange = document.getElementById('time-range')?.value;

            if (!startDate && (!timeRange || timeRange === 'none')) {
                showToast('Please select either a specific date or a time range', toastTypes.WARNING);
                return;
            }

            try {
                filterBtn.disabled = true;
                filterBtn.innerHTML = `
                    <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Filtering...
                `;

                await window.meterModal?.fetchMeterData();
                showToast('Data filtered successfully!', toastTypes.SUCCESS);

            } catch (error) {
                console.error('Filter failed:', error);
                showToast('Failed to filter data', toastTypes.ERROR);
            } finally {
                filterBtn.disabled = false;
                filterBtn.innerHTML = `
                    <i class='bx bx-filter'></i>
                    Apply Filter
                `;
            }
        });
    }

    // Add export button event listener
    const exportBtn = document.querySelector('button:has(i.bx-export)');
    if (exportBtn) {
        exportBtn.addEventListener('click', async () => {
            try {
                exportBtn.disabled = true;
                exportBtn.innerHTML = `
                    <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Exporting...
                `;

                await exportTableData();
                showToast('Data exported successfully!', toastTypes.SUCCESS);

            } catch (error) {
                console.error('Export failed:', error);
                showToast('Failed to export data', toastTypes.ERROR);
            } finally {
                exportBtn.disabled = false;
                exportBtn.innerHTML = `
                    <i class='bx bx-export'></i>
                    Export Data
                `;
            }
        });
    }
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

// PC Dropdown Controller
class PCDropdownController {
    constructor() {
        this.isOpen = false;
        this.currentPcId = null;
        this.pcList = [];
        this.filteredPcList = [];
        this.setupEventListeners();
    }

    setupEventListeners() {
        // PC Selection Button
        const selectBtn = document.getElementById('pc-select-btn');
        const modal = document.getElementById('pc-selection-modal');
        const closeBtn = document.getElementById('close-pc-modal');
        const searchInput = document.getElementById('pc-search');

        selectBtn?.addEventListener('click', () => this.openModal());
        closeBtn?.addEventListener('click', () => this.closeModal());
        
        // Close modal on outside click
        modal?.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });

        // Search functionality
        searchInput?.addEventListener('input', (e) => {
            this.filterPCs(e.target.value);
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeModal();
            }
        });
    }

    openModal() {
        const modal = document.getElementById('pc-selection-modal');
        modal?.classList.remove('hidden');
        this.isOpen = true;
        
        // Focus search input
        const searchInput = document.getElementById('pc-search');
        searchInput?.focus();
    }

    closeModal() {
        const modal = document.getElementById('pc-selection-modal');
        modal?.classList.add('hidden');
        this.isOpen = false;
        
        // Clear search
        const searchInput = document.getElementById('pc-search');
        if (searchInput) {
            searchInput.value = '';
            this.filterPCs('');
        }
    }

    async fetchPCList() {
        try {
            const response = await fetch(API_URLS.getPcList, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ dummy: null })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch PC list');
            }

            const data = await response.json();
            this.pcList = data.pcList || [];
            this.filteredPcList = [...this.pcList];
            this.renderPCOptions();
        } catch (error) {
            console.error('Error fetching PC list:', error);
            showToast('Failed to load PC list', toastTypes.ERROR);
        }
    }

    filterPCs(query) {
        const searchTerm = query.toLowerCase();
        this.filteredPcList = this.pcList.filter(pc => 
            pc.pcName.toLowerCase().includes(searchTerm)
        );
        this.renderPCOptions();
    }

    renderPCOptions() {
        const listElement = document.getElementById('pc-options-list');
        if (!listElement) return;

        if (this.filteredPcList.length === 0) {
            listElement.innerHTML = `
                <div class="flex flex-col items-center justify-center py-4 text-gray-500">
                    <i class='bx bx-search-alt-2 text-3xl mb-2'></i>
                    <p class="text-sm">No PCs found</p>
                </div>
            `;
            return;
        }

        listElement.innerHTML = this.filteredPcList.map(pc => `
            <button class="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between rounded-lg transition-colors ${
                this.currentPcId === pc.pcId ? 'bg-purple-50 text-purple-600' : 'text-gray-700'
            }" data-pc-id="${pc.pcId}">
                <div class="flex items-center gap-3">
                    <i class='bx bx-desktop text-xl ${
                        this.currentPcId === pc.pcId ? 'text-purple-600' : 'text-gray-400'
                    }'></i>
                    <div class="flex flex-col">
                        <span class="font-medium">${pc.pcName}</span>
                        <span class="text-xs text-gray-500">Last active: 2 hours ago</span>
                    </div>
                </div>
                ${this.currentPcId === pc.pcId ? 
                    '<i class="bx bx-check text-purple-600 text-xl"></i>' : 
                    ''}
            </button>
        `).join('');

        // Add click event listeners to options
        listElement.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', (e) => {
                const pcId = e.currentTarget.dataset.pcId;
                const pc = this.pcList.find(p => p.pcId === pcId);
                if (pc) {
                    this.selectPC(pc.pcId, pc.pcName);
                }
            });
        });

        // Update selected PC text if there's a current PC
        if (this.currentPcId) {
            const currentPC = this.pcList.find(pc => pc.pcId === this.currentPcId);
            const selectedText = document.getElementById('selected-pc');
            if (currentPC && selectedText) {
                selectedText.textContent = currentPC.pcName;
            }
        }
    }

    selectPC(pcId, pcName) {
        this.currentPcId = pcId;
        const selectedText = document.getElementById('selected-pc');
        if (selectedText) {
            selectedText.textContent = pcName;
        }
        this.closeModal();
        this.fetchMeterList(pcId); // Fetch meters for selected PC

        // Show success toast
        showToast(`Switched to ${pcName}`, toastTypes.SUCCESS);
    }

    async fetchMeterList(pcId) {
        try {
            const response = await fetch(API_URLS.getMeterList, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ pcId })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch meter list');
            }

            const data = await response.json();
            updateMeterTable(data);
            updateDashboardStats(data);
        } catch (error) {
            console.error('Error fetching meter list:', error);
            showToast('Failed to load meters', toastTypes.ERROR);
        }
    }
}

// Meter Modal Controller
class MeterModalController {
    constructor() {
        this.currentMeterId = null;
        this.meterData = [];
        this.currentPage = 1;
        this.pageSize = 10;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Close button click
        DOM.meterModal.closeBtn()?.addEventListener('click', () => this.closeModal());

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isModalOpen()) {
                this.closeModal();
            }
        });

        // Close on overlay click
        DOM.meterModal.container()?.addEventListener('click', (e) => {
            if (e.target === DOM.meterModal.container()) {
                this.closeModal();
            }
        });
    }

    isModalOpen() {
        return !DOM.meterModal.container()?.classList.contains('hidden');
    }

    async openModal(meterId) {
        if (!meterId) {
            showToast('Invalid meter ID', toastTypes.ERROR);
            return;
        }

        this.currentMeterId = meterId;
        
        // Show modal and overlay
        DOM.meterModal.container()?.classList.remove('hidden');
        DOM.meterModal.overlay()?.classList.remove('hidden');
        
        // Reset state
        this.currentPage = 1;
        this.meterData = [];
        
        // Fetch data
        await this.fetchMeterData();
    }

    closeModal() {
        // Hide modal and overlay
        DOM.meterModal.container()?.classList.add('hidden');
        DOM.meterModal.overlay()?.classList.add('hidden');
        
        // Reset state
        this.currentMeterId = null;
        this.meterData = [];
    }

    async fetchMeterData() {
        try {
            this.showLoadingState();

            const response = await fetch(API_URLS.getMeterData, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    meterId: this.currentMeterId,
                    pageSize: this.pageSize,
                    pageNumber: this.currentPage
                })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch meter data');
            }

            const data = await response.json();
            this.meterData = data.meterData || [];
            this.renderMeterData();
        } catch (error) {
            console.error('Error fetching meter data:', error);
            this.showErrorState(error.message);
        }
    }

    showLoadingState() {
        const table = DOM.meterModal.table();
        if (!table) return;
        
        table.innerHTML = `
            <div class="flex items-center justify-center p-8">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                <span class="ml-3 text-gray-600">Loading meter data...</span>
            </div>
        `;
    }

    showErrorState(message) {
        const table = DOM.meterModal.table();
        if (!table) return;

        table.innerHTML = `
            <div class="flex flex-col items-center justify-center p-8 text-red-600">
                <i class='bx bx-error-circle text-4xl mb-2'></i>
                <p class="text-lg font-medium">${message}</p>
                <button onclick="window.meterModal.fetchMeterData()" 
                    class="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
                    Try Again
                </button>
            </div>
        `;
    }

    renderMeterData() {
        const table = DOM.meterModal.table();
        if (!table || !this.meterData.length) {
            this.showEmptyState();
            return;
        }

        const rows = this.meterData.map((meter, index) => `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-4 py-2 text-sm">${index + 1}</td>
                <td class="px-4 py-2 text-sm font-medium">${meter.dataCount}</td>
                <td class="px-4 py-2 text-sm">${meter.timeStamp}</td>
                <td class="px-4 py-2 text-sm">${meter.v12}</td>
                <td class="px-4 py-2 text-sm">${meter.v23}</td>
                <td class="px-4 py-2 text-sm">${meter.v31}</td>
                <td class="px-4 py-2 text-sm">${meter.i1}</td>
                <td class="px-4 py-2 text-sm">${meter.i2}</td>
                <td class="px-4 py-2 text-sm">${meter.i3}</td>
                <td class="px-4 py-2 text-sm font-medium">${meter.kw}</td>
                <td class="px-4 py-2 text-sm">${meter.kva}</td>
                <td class="px-4 py-2 text-sm">${meter.kvar}</td>
                <td class="px-4 py-2 text-sm">${meter.pf}</td>
                <td class="px-4 py-2 text-sm">${meter.hz}</td>
                <td class="px-4 py-2 text-sm font-medium">${meter.kwh}</td>
                <td class="px-4 py-2 text-sm font-medium">${meter.kvah}</td>
                <td class="px-4 py-2">
                    <span class="px-2 py-1 text-xs font-medium rounded-full ${
                        meter.pFlag === 'Normal' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                    }">
                        ${meter.pFlag}
                    </span>
                </td>
                <td class="px-4 py-2">
                    <span class="px-2 py-1 text-xs font-medium rounded-full ${
                        meter.lFlag === 'Normal' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                    }">
                        ${meter.lFlag}
                    </span>
                </td>
            </tr>
        `).join('');

        table.innerHTML = `
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">S.No</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Data Count</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time Stamp</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">V12</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">V23</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">V31</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">I1</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">I2</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">I3</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Kw</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Kva</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Kvar</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pf</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hz</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Kwh</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Kvah</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">P Flag</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">L Flag</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${rows}
                </tbody>
            </table>
        `;

        this.updatePagination();
    }

    showEmptyState() {
        const table = DOM.meterModal.table();
        if (!table) return;

        table.innerHTML = `
            <div class="flex flex-col items-center justify-center p-8 text-gray-500">
                <i class='bx bx-data text-4xl mb-2'></i>
                <p class="text-lg font-medium">No meter data available</p>
            </div>
        `;
    }

    updatePagination() {
        // Implementation for pagination...
    }
}

// Global function for viewing meter details
window.viewMeterDetails = (meterId) => {
    window.meterModal.openModal(meterId);
};

// Global function for closing meter modal
window.closeMeterModal = () => {
    window.meterModal?.closeModal();
};