// Global variables
const token = getSessionToken();
let meterData = [];
let currentPage = 1;
let pageSize = 10;
let globalMeterId = null;

// Initialize when document loads
document.addEventListener('DOMContentLoaded', () => {
    fetchMeterList();
    setupEventListeners();
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
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch meter list');
        }

        updateMeterTable(data);
        updateMeterCount(data);

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
        row.setAttribute('data-meter-id', meter.meterId || 'N/A');

        const healthStatus = meter.meterHealthStatus || 'Unknown';
        const statusClass = getStatusClass(healthStatus);

        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${meter.meterNum || 'N/A'}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${meter.meterName || 'N/A'}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${meter.make || 'N/A'}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${meter.kwAvg || '0'}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${meter.nRec || '0'}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="${statusClass}">
                    ${healthStatus}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                <div class="flex space-x-3">
                    <button class="text-indigo-600 hover:text-indigo-900 transition-colors view-meter-btn">
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function getStatusClass(status) {
    const statusClasses = {
        'Healthy': 'px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800',
        'Warning': 'px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800',
        'Critical': 'px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800',
        'Unknown': 'px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800'
    };
    return statusClasses[status] || statusClasses['Unknown'];
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

function updateMeterCount(data) {
    const totalMetersElement = document.querySelector('.text-3xl.font-bold.text-gray-900');
    if (totalMetersElement) {
        const meterCount = data.meterList?.length || 0;
        totalMetersElement.textContent = meterCount;
        
        // Update the status message below the count
        const statusElement = document.querySelector('.inline-flex.items-center.px-2\\.5.py-0\\.5.rounded-full');
        if (statusElement) {
            if (meterCount > 0) {
                statusElement.innerHTML = `
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                    All Meters Connected
                `;
            } else {
                statusElement.innerHTML = `
                    <div class="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                    No Meters Available
                `;
            }
        }
    }
}

// Event listener for analytics button clicks
document.addEventListener('DOMContentLoaded', () => {
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
});

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