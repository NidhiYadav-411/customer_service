/**
 * Customer Service Center - Service Agents Management Script
 */

let allAgents = [];

document.addEventListener('DOMContentLoaded', () => {
    loadAgents();
    setupEventListeners();
});

// Load all agents from backend API
async function loadAgents() {
    const cardsContainer = document.getElementById('agentCardsContainer');
    const tbody = document.getElementById('agentsTableBody');
    const countBadge = document.getElementById('agentsCount');

    try {
        const response = await fetch('/api/agents');
        if (!response.ok) throw new Error('Failed to load agents');
        allAgents = await response.json();

        if (countBadge) {
            countBadge.textContent = allAgents.length;
        }

        renderAgentCards(allAgents);
        renderAgentsTable(allAgents);
    } catch (err) {
        console.error('Error loading agents:', err);
        cardsContainer.innerHTML = `
            <div class="col-12 text-center text-danger py-4">
                <i class="bi bi-exclamation-triangle-fill me-1"></i> Error loading agents from backend.
            </div>
        `;
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-danger py-4">
                    Error loading agents.
                </td>
            </tr>
        `;
    }
}

// Render visual cards for each agent
function renderAgentCards(agents) {
    const container = document.getElementById('agentCardsContainer');
    if (!container) return;

    if (agents.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-4 text-muted">
                No agents registered. Please add at least one agent.
            </div>
        `;
        return;
    }

    container.innerHTML = agents.map(agent => {
        const isBusy = agent.status === 'BUSY';
        const statusBadge = isBusy 
            ? '<span class="badge badge-status badge-busy"><i class="bi bi-broadcast"></i> In Call</span>'
            : '<span class="badge badge-status badge-available"><i class="bi bi-check-circle"></i> Available</span>';

        const initial = agent.name ? agent.name.charAt(0).toUpperCase() : 'A';
        const avatarBg = agent.avatarColor || '#2563eb';

        return `
            <div class="col-md-6 col-lg-4">
                <div class="agent-card h-100 ${isBusy ? 'agent-active' : ''}">
                    <div class="d-flex align-items-center gap-3 mb-3">
                        <div class="agent-avatar" style="background-color: ${avatarBg};">
                            ${initial}
                        </div>
                        <div>
                            <h6 class="fw-bold text-dark mb-0">${escapeHtml(agent.name)}</h6>
                            <small class="text-muted font-monospace">${escapeHtml(agent.id)}</small>
                        </div>
                        <div class="ms-auto">
                            ${statusBadge}
                        </div>
                    </div>

                    <div class="p-2 bg-light rounded-3 mb-3 small">
                        <div class="d-flex justify-content-between text-secondary mb-1">
                            <span>Current Customer:</span>
                            <strong class="text-dark">${escapeHtml(agent.currentCustomer || 'None (Idle)')}</strong>
                        </div>
                        <div class="d-flex justify-content-between text-secondary">
                            <span>Handled Workload:</span>
                            <span class="badge bg-white text-dark border font-monospace">
                                ${agent.totalTimeSpent || 0} time units
                            </span>
                        </div>
                    </div>

                    <div class="d-flex justify-content-between align-items-center text-muted small pt-2 border-top">
                        <span><i class="bi bi-check2-all text-success me-1"></i> Turns: <strong>${agent.queriesHandled || 0}</strong></span>
                        <button class="btn btn-sm btn-outline-danger py-0 px-2" 
                                onclick="deleteAgent('${agent.id}', '${escapeHtml(agent.name)}')"
                                title="Remove agent">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Render detailed table
function renderAgentsTable(agents) {
    const tbody = document.getElementById('agentsTableBody');
    if (!tbody) return;

    if (agents.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4 text-muted">No agents registered.</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = agents.map(agent => {
        const isBusy = agent.status === 'BUSY';
        const statusBadge = isBusy 
            ? '<span class="badge badge-status badge-busy"><i class="bi bi-broadcast"></i> In Call</span>'
            : '<span class="badge badge-status badge-available"><i class="bi bi-check-circle"></i> Available</span>';

        return `
            <tr>
                <td class="font-monospace fw-bold text-primary">${escapeHtml(agent.id)}</td>
                <td class="fw-semibold">
                    <span class="d-inline-block rounded-circle me-1" style="width: 10px; height: 10px; background-color: ${agent.avatarColor || '#2563eb'};"></span>
                    ${escapeHtml(agent.name)}
                </td>
                <td>${statusBadge}</td>
                <td class="text-secondary small">${escapeHtml(agent.currentCustomer || 'None (Idle)')}</td>
                <td><span class="badge bg-light text-dark border font-monospace">${agent.queriesHandled || 0}</span></td>
                <td><span class="badge bg-light text-primary border font-monospace">${agent.totalTimeSpent || 0} units</span></td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-danger" 
                            onclick="deleteAgent('${agent.id}', '${escapeHtml(agent.name)}')"
                            title="Delete agent">
                        <i class="bi bi-trash3"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Setup form and button event listeners
function setupEventListeners() {
    const form = document.getElementById('addAgentForm');
    const nameInput = document.getElementById('agentName');
    const feedback = document.getElementById('agentNameFeedback');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const agentName = nameInput.value.trim();

        // Client side validation
        if (!agentName) {
            nameInput.classList.add('is-invalid');
            feedback.textContent = 'Agent name cannot be empty.';
            return;
        }

        // Check duplicates on client
        const duplicate = allAgents.some(a => a.name.toLowerCase() === agentName.toLowerCase());
        if (duplicate) {
            nameInput.classList.add('is-invalid');
            feedback.textContent = `Agent "${agentName}" already exists! Please choose another name.`;
            return;
        }

        nameInput.classList.remove('is-invalid');

        try {
            const response = await fetch('/api/agents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: agentName })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to add agent');
            }

            const created = await response.json();
            showToast(`Agent "${created.name}" registered successfully!`, 'success');
            form.reset();
            loadAgents();
        } catch (err) {
            nameInput.classList.add('is-invalid');
            feedback.textContent = err.message;
            showToast(err.message, 'danger');
        }
    });

    const btnRefresh = document.getElementById('btnRefreshAgents');
    if (btnRefresh) {
        btnRefresh.addEventListener('click', () => {
            loadAgents();
            showToast('Agents refreshed from backend.', 'info');
        });
    }
}

// Delete Agent
async function deleteAgent(id, name) {
    if (allAgents.length <= 1) {
        showToast('At least one agent must remain to run the service center.', 'danger');
        return;
    }

    if (!confirm(`Are you sure you want to remove agent "${name}" (${id})?`)) {
        return;
    }

    try {
        const response = await fetch(`/api/agents/${id}`, { method: 'DELETE' });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Failed to delete agent');
        }

        showToast(`Agent "${name}" removed successfully.`, 'success');
        loadAgents();
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
