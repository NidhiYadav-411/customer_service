/**
 * Customer Service Center - Dashboard Script
 */

document.addEventListener('DOMContentLoaded', () => {
    loadDashboardStats();
    loadQueriesPreview();
    setupEventHandlers();
});

// Load summary metrics from Spring Boot backend
async function loadDashboardStats() {
    try {
        const response = await fetch('/api/simulation/status');
        if (!response.ok) throw new Error('Failed to load status');
        const stats = await response.json();

        document.getElementById('statTotalQueries').textContent = stats.totalQueries ?? 0;
        document.getElementById('statPendingQueries').textContent = stats.pendingQueries ?? 0;
        document.getElementById('statCompletedQueries').textContent = stats.completedQueries ?? 0;
        document.getElementById('statAvailableAgents').textContent = stats.availableAgents ?? 0;
        document.getElementById('statTotalAgents').textContent = `${stats.totalAgents ?? 0} Service Reps`;
        if (stats.defaultQuantum) {
            document.getElementById('statQuantumValue').textContent = stats.defaultQuantum;
        }
    } catch (err) {
        console.error('Error loading dashboard stats:', err);
    }
}

// Load list of customer queries from backend
async function loadQueriesPreview() {
    const tbody = document.getElementById('dashboardQueriesTbody');
    try {
        const response = await fetch('/api/queries');
        if (!response.ok) throw new Error('Failed to fetch queries');
        const queries = await response.json();

        if (!queries || queries.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-4 text-muted">
                        No customer queries in system. Click "Add Query" or "Reset Sample Data".
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = queries.map(q => {
            let statusBadge = '<span class="badge badge-status badge-pending"><i class="bi bi-clock"></i> Pending</span>';
            if (q.status === 'IN_PROGRESS') {
                statusBadge = '<span class="badge badge-status badge-in-progress"><i class="bi bi-gear-fill"></i> In Progress</span>';
            } else if (q.status === 'COMPLETED') {
                statusBadge = '<span class="badge badge-status badge-completed"><i class="bi bi-check-circle-fill"></i> Completed</span>';
            }

            return `
                <tr>
                    <td class="fw-bold text-primary font-monospace">${escapeHtml(q.id)}</td>
                    <td class="fw-semibold">${escapeHtml(q.customerName)}</td>
                    <td class="text-secondary small">${escapeHtml(q.queryDescription)}</td>
                    <td>
                        <span class="badge bg-light text-dark border font-monospace">
                            ${q.estimatedTime} units
                        </span>
                    </td>
                    <td>${statusBadge}</td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        console.error('Error loading queries preview:', err);
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-danger py-4">
                    <i class="bi bi-exclamation-triangle-fill me-1"></i> Error loading queries. Make sure backend is running.
                </td>
            </tr>
        `;
    }
}

// Event handlers
function setupEventHandlers() {
    // Quick Add Query Form
    const quickForm = document.getElementById('quickAddQueryForm');
    if (quickForm) {
        quickForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const customerName = document.getElementById('quickCustomerName').value.trim();
            const queryDesc = document.getElementById('quickQueryDesc').value.trim();
            const estimatedTime = parseInt(document.getElementById('quickEstimatedTime').value, 10);

            if (!customerName || !queryDesc || isNaN(estimatedTime) || estimatedTime <= 0) {
                showToast('Please fill all required fields with valid values.', 'danger');
                return;
            }

            try {
                const response = await fetch('/api/queries', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        customerName: customerName,
                        queryDescription: queryDesc,
                        estimatedTime: estimatedTime,
                        assignedAgent: 'Auto'
                    })
                });

                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.error || 'Failed to add query');
                }

                // Close modal
                const modalEl = document.getElementById('quickAddQueryModal');
                const modal = bootstrap.Modal.getInstance(modalEl);
                if (modal) modal.hide();
                quickForm.reset();

                showToast(`Customer query added successfully!`, 'success');
                loadDashboardStats();
                loadQueriesPreview();
            } catch (err) {
                showToast(err.message, 'danger');
            }
        });
    }

    // Reset Defaults Button
    const btnResetDefaults = document.getElementById('btnResetDefaults');
    if (btnResetDefaults) {
        btnResetDefaults.addEventListener('click', async () => {
            try {
                const response = await fetch('/api/simulation/reset-defaults', { method: 'POST' });
                if (!response.ok) throw new Error('Failed to reset sample data');
                showToast('Sample queries and agents restored successfully!', 'success');
                loadDashboardStats();
                loadQueriesPreview();
            } catch (err) {
                showToast(err.message, 'danger');
            }
        });
    }
}

// Utility: Show Bootstrap Toast
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
