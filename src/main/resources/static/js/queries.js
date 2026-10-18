/**
 * Customer Service Center - Customer Queries Management Script
 */

let allQueries = [];

document.addEventListener('DOMContentLoaded', () => {
    loadAgentsDropdown();
    loadQueries();
    setupEventListeners();
});

// Load available agents for the optional dropdown
async function loadAgentsDropdown() {
    const select = document.getElementById('assignedAgent');
    if (!select) return;

    try {
        const response = await fetch('/api/agents');
        if (!response.ok) return;
        const agents = await response.json();

        // Keep default auto option
        select.innerHTML = '<option value="Auto" selected>Auto (Round Robin Agent Order)</option>';
        agents.forEach(agent => {
            const opt = document.createElement('option');
            opt.value = agent.name;
            opt.textContent = `${agent.name} (${agent.id})`;
            select.appendChild(opt);
        });
    } catch (err) {
        console.warn('Could not load agents dropdown:', err);
    }
}

// Fetch all queries from Spring Boot backend
async function loadQueries() {
    const tbody = document.getElementById('queriesTableBody');
    try {
        const response = await fetch('/api/queries');
        if (!response.ok) throw new Error('Failed to load queries');
        allQueries = await response.json();

        renderQueries();
    } catch (err) {
        console.error('Error loading queries:', err);
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-danger py-4">
                    <i class="bi bi-exclamation-triangle-fill me-1"></i> Failed to connect to server. Is Spring Boot running?
                </td>
            </tr>
        `;
    }
}

// Render queries with filter and search applied
function renderQueries() {
    const tbody = document.getElementById('queriesTableBody');
    const badgeCount = document.getElementById('queriesCountBadge');
    const searchTerm = document.getElementById('searchQueryInput').value.toLowerCase().trim();
    const filterStatus = document.getElementById('filterStatusSelect').value;

    const filtered = allQueries.filter(q => {
        const matchesSearch = q.customerName.toLowerCase().includes(searchTerm) ||
                              q.queryDescription.toLowerCase().includes(searchTerm) ||
                              q.id.toLowerCase().includes(searchTerm);
        const matchesStatus = (filterStatus === 'ALL') || (q.status === filterStatus);
        return matchesSearch && matchesStatus;
    });

    if (badgeCount) {
        badgeCount.textContent = filtered.length;
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-5 text-muted">
                    <i class="bi bi-search fs-3 d-block mb-2 text-secondary"></i>
                    No customer queries found matching your criteria.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filtered.map(q => {
        let statusBadge = '<span class="badge badge-status badge-pending"><i class="bi bi-clock"></i> Pending</span>';
        if (q.status === 'IN_PROGRESS') {
            statusBadge = '<span class="badge badge-status badge-in-progress"><i class="bi bi-gear-fill"></i> In Progress</span>';
        } else if (q.status === 'COMPLETED') {
            statusBadge = '<span class="badge badge-status badge-completed"><i class="bi bi-check-circle-fill"></i> Completed</span>';
        }

        // Allow deletion if pending or completed
        const isDeleteDisabled = (q.status === 'IN_PROGRESS');

        return `
            <tr>
                <td>
                    <span class="badge font-monospace" style="background-color: ${q.color || '#3b82f6'}; color: white;">
                        ${escapeHtml(q.id)}
                    </span>
                </td>
                <td class="fw-semibold text-dark">${escapeHtml(q.customerName)}</td>
                <td class="text-secondary small" style="max-width: 250px;">
                    ${escapeHtml(q.queryDescription)}
                </td>
                <td>
                    <span class="badge bg-light text-dark border font-monospace">
                        ${q.estimatedTime} units
                    </span>
                </td>
                <td>
                    <span class="badge bg-light text-primary border font-monospace">
                        ${q.remainingTime} units
                    </span>
                </td>
                <td>${statusBadge}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-danger" 
                            onclick="deleteQuery('${q.id}')" 
                            ${isDeleteDisabled ? 'disabled title="Cannot delete query while in progress"' : 'title="Delete query"'}>
                        <i class="bi bi-trash3"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Setup Event Listeners
function setupEventListeners() {
    // Add Query Form Submission
    const form = document.getElementById('addQueryForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('customerName');
        const descInput = document.getElementById('queryDescription');
        const timeInput = document.getElementById('estimatedTime');
        const agentInput = document.getElementById('assignedAgent');

        const customerName = nameInput.value.trim();
        const queryDescription = descInput.value.trim();
        const estimatedTime = parseInt(timeInput.value, 10);
        const assignedAgent = agentInput ? agentInput.value : 'Auto';

        // Validation
        let isValid = true;
        if (!customerName) {
            nameInput.classList.add('is-invalid');
            isValid = false;
        } else {
            nameInput.classList.remove('is-invalid');
        }

        if (!queryDescription) {
            descInput.classList.add('is-invalid');
            isValid = false;
        } else {
            descInput.classList.remove('is-invalid');
        }

        if (isNaN(estimatedTime) || estimatedTime <= 0) {
            timeInput.classList.add('is-invalid');
            isValid = false;
        } else {
            timeInput.classList.remove('is-invalid');
        }

        if (!isValid) return;

        try {
            const response = await fetch('/api/queries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerName,
                    queryDescription,
                    estimatedTime,
                    assignedAgent
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to add query');
            }

            const created = await response.json();
            showToast(`Query ${created.id} added for ${created.customerName}!`, 'success');

            // Reset form
            form.reset();
            timeInput.value = 4;
            loadQueries();
        } catch (err) {
            showToast(err.message, 'danger');
        }
    });

    // Reset status to pending button
    const btnResetQueries = document.getElementById('btnResetQueries');
    if (btnResetQueries) {
        btnResetQueries.addEventListener('click', async () => {
            try {
                const response = await fetch('/api/queries/reset', { method: 'POST' });
                if (!response.ok) throw new Error('Failed to reset queries');
                showToast('All customer queries reset to Pending state!', 'success');
                loadQueries();
            } catch (err) {
                showToast(err.message, 'danger');
            }
        });
    }

    // Refresh button
    const btnReload = document.getElementById('btnReloadQueries');
    if (btnReload) {
        btnReload.addEventListener('click', () => {
            loadQueries();
            showToast('Queries refreshed from backend.', 'info');
        });
    }

    // Search and filter listeners
    document.getElementById('searchQueryInput').addEventListener('input', renderQueries);
    document.getElementById('filterStatusSelect').addEventListener('change', renderQueries);
}

// Delete Query
async function deleteQuery(id) {
    if (!confirm(`Are you sure you want to delete query ${id}?`)) {
        return;
    }

    try {
        const response = await fetch(`/api/queries/${id}`, { method: 'DELETE' });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Failed to delete query');
        }

        showToast(`Query ${id} deleted successfully.`, 'success');
        loadQueries();
    } catch (err) {
        showToast(err.message, 'danger');
    }
}

// Toast helper
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toastId = 'toast_' + Date.now();
    const bgClass = type === 'success' ? 'bg-success text-white' :
                    type === 'danger' ? 'bg-danger text-white' : 'bg-primary text-white';

    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center ${bgClass} border-0 shadow-lg" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="bi bi-info-circle-fill me-2"></i> ${escapeHtml(message)}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', toastHtml);
    const toastEl = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastEl, { delay: 4000 });
    toast.show();

    toastEl.addEventListener('hidden.bs.toast', () => {
        toastEl.remove();
    });
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function(m) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[m];
    });
}
