/**
 * Customer Service Center - Round Robin Process Visualization Engine
 * Communicates with Java Spring Boot backend to retrieve calculated algorithm steps
 * and presents smooth, step-by-step animations for viva presentation.
 */

let simulationResult = null;
let currentStepIndex = -1;
let isPlaying = false;
let playInterval = null;
let stepDuration = 1200; // ms per step

document.addEventListener('DOMContentLoaded', () => {
    initControls();
    loadInitialData();
});

// Load initial query and agent preview so queue track is not blank before starting
async function loadInitialData() {
    try {
        const [qRes, aRes] = await Promise.all([
            fetch('/api/queries'),
            fetch('/api/agents')
        ]);

        if (qRes.ok && aRes.ok) {
            const queries = await qRes.json();
            const agents = await aRes.json();
            renderInitialReadyQueue(queries);
            renderInitialAgents(agents);
        }
    } catch (err) {
        console.warn('Initial data load warning:', err);
    }
}

function renderInitialReadyQueue(queries) {
    const track = document.getElementById('queueTrack');
    const badge = document.getElementById('queueCountBadge');

    if (!queries || queries.length === 0) {
        track.innerHTML = `
            <div class="text-center w-100 text-muted py-4">
                Queue is empty. Please add queries from the <a href="queries.html">Queries</a> page.
            </div>
        `;
        badge.textContent = '0 Waiting';
        return;
    }

    badge.textContent = `${queries.length} Queries Ready`;

    track.innerHTML = queries.map((q, idx) => `
        <div class="queue-card ${idx === 0 ? 'border-primary' : ''}" id="init-card-${q.id}">
            <div class="queue-card-header">
                <span class="badge" style="background-color: ${q.color || '#2563eb'}; color: white;">
                    ${escapeHtml(q.id)}
                </span>
                <span class="badge badge-status badge-pending">Pending</span>
            </div>
            <h6 class="queue-card-title">${escapeHtml(q.customerName)}</h6>
            <div class="queue-card-desc">${escapeHtml(q.queryDescription)}</div>
            <div class="queue-card-times">
                <span>Burst Time:</span>
                <span class="time-badge text-dark">${q.estimatedTime} units</span>
            </div>
            <div class="progress" style="height: 6px;">
                <div class="progress-bar bg-primary" style="width: 100%;"></div>
            </div>
        </div>
    `).join('');
}

function renderInitialAgents(agents) {
    const row = document.getElementById('simAgentsRow');
    const badge = document.getElementById('simAgentsCountBadge');
    if (!agents || agents.length === 0) {
        row.innerHTML = `<div class="col-12 text-center text-muted py-4">No agents available.</div>`;
        return;
    }

    badge.textContent = `${agents.length} Representatives`;

    row.innerHTML = agents.map(agent => {
        const initial = agent.name ? agent.name.charAt(0).toUpperCase() : 'A';
        const color = agent.avatarColor || '#2563eb';
        return `
            <div class="col-md-6 col-lg-4" id="agent-col-${agent.id}">
                <div class="agent-card">
                    <div class="d-flex align-items-center gap-3 mb-2">
                        <div class="agent-avatar" style="background-color: ${color};">
                            ${initial}
                        </div>
                        <div>
                            <h6 class="fw-bold mb-0 text-dark">${escapeHtml(agent.name)}</h6>
                            <small class="text-muted font-monospace">${escapeHtml(agent.id)}</small>
                        </div>
                        <div class="ms-auto">
                            <span class="badge badge-status badge-available">
                                <i class="bi bi-check-circle"></i> Idle
                            </span>
                        </div>
                    </div>
                    <div class="p-2 bg-light rounded-3 small">
                        <div class="d-flex justify-content-between text-secondary mb-1">
                            <span>Serving:</span>
                            <strong class="text-dark">None (Idle)</strong>
                        </div>
                        <div class="progress" style="height: 6px;">
                            <div class="progress-bar bg-success" style="width: 0%;"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Initialize Controls and Button Listeners
function initControls() {
    const btnStart = document.getElementById('btnStart');
    const btnPause = document.getElementById('btnPause');
    const btnResume = document.getElementById('btnResume');
    const btnReset = document.getElementById('btnReset');
    const btnNext = document.getElementById('btnNext');
    const btnPrev = document.getElementById('btnPrev');
    const speedSlider = document.getElementById('speedSlider');
    const speedLabel = document.getElementById('speedLabel');
    const btnRerunSim = document.getElementById('btnRerunSim');
    const btnReloadData = document.getElementById('btnReloadData');
    const btnClearLog = document.getElementById('btnClearLog');

    btnStart.addEventListener('click', startSimulation);
    btnPause.addEventListener('click', pauseSimulation);
    btnResume.addEventListener('click', resumeSimulation);
    btnReset.addEventListener('click', resetSimulation);
    btnNext.addEventListener('click', nextStep);
    btnPrev.addEventListener('click', prevStep);

    if (btnRerunSim) {
        btnRerunSim.addEventListener('click', () => {
            resetSimulation();
            startSimulation();
        });
    }

    if (btnReloadData) {
        btnReloadData.addEventListener('click', () => {
            resetSimulation();
            loadInitialData();
            showToast('Simulation refreshed from server.', 'info');
        });
    }

    if (btnClearLog) {
        btnClearLog.addEventListener('click', () => {
            document.getElementById('timelineLogBox').innerHTML = '';
            document.getElementById('logCountBadge').textContent = '0 events';
        });
    }

    // Speed Slider
    speedSlider.addEventListener('input', (e) => {
        stepDuration = parseInt(e.target.value, 10);
        speedLabel.textContent = (stepDuration / 1000).toFixed(1) + 's / step';

        if (isPlaying) {
            clearInterval(playInterval);
            playInterval = setInterval(stepLoop, stepDuration);
        }
    });
}

// Start Simulation: Fetch simulation from Java backend and start visualization
async function startSimulation() {
    const quantum = parseInt(document.getElementById('timeQuantumInput').value, 10) || 2;
    if (quantum <= 0) {
        showToast('Please enter a valid time quantum greater than 0', 'danger');
        return;
    }

    updateSimBadge('Loading...', 'warning');

    try {
        const response = await fetch(`/api/simulation/run?quantum=${quantum}`, {
            method: 'POST'
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Backend simulation failed');
        }

        simulationResult = await response.json();

        if (!simulationResult.steps || simulationResult.steps.length === 0) {
            showToast('No queries or agents available for simulation.', 'warning');
            updateSimBadge('Empty Queue', 'secondary');
            return;
        }

        // Reset visual state
        currentStepIndex = -1;
        document.getElementById('timelineLogBox').innerHTML = '';
        document.getElementById('ganttBar').innerHTML = '';
        document.getElementById('ganttTicks').innerHTML = '';
        document.getElementById('summaryCard').style.display = 'none';

        // Update UI buttons
        document.getElementById('btnStart').style.display = 'none';
        document.getElementById('btnPause').style.display = 'inline-flex';
        document.getElementById('btnResume').style.display = 'none';

        isPlaying = true;
        updateSimBadge(`Running (Quantum: ${quantum})`, 'primary');

        // Execute first step immediately, then start interval
        nextStep();
        clearInterval(playInterval);
        playInterval = setInterval(stepLoop, stepDuration);

        showToast(`Round Robin started with Time Quantum = ${quantum}`, 'success');
    } catch (err) {
        console.error('Simulation error:', err);
        showToast(err.message, 'danger');
        updateSimBadge('Error', 'danger');
    }
}

// Loop callback for interval
function stepLoop() {
    if (!isPlaying || !simulationResult) return;

    if (currentStepIndex < simulationResult.steps.length - 1) {
        nextStep();
    } else {
        finishSimulation();
    }
}

// Step forward
function nextStep() {
    if (!simulationResult || !simulationResult.steps) return;
    if (currentStepIndex < simulationResult.steps.length - 1) {
        currentStepIndex++;
        renderStep(simulationResult.steps[currentStepIndex]);
        if (currentStepIndex === simulationResult.steps.length - 1 && isPlaying) {
            finishSimulation();
        }
    }
}

// Step backward
function prevStep() {
    if (!simulationResult || !simulationResult.steps) return;
    if (currentStepIndex > 0) {
        currentStepIndex--;
        renderStep(simulationResult.steps[currentStepIndex]);
        // Pause if user manually steps back
        if (isPlaying) {
            pauseSimulation();
        }
    }
}

// Pause
function pauseSimulation() {
    isPlaying = false;
    clearInterval(playInterval);
    document.getElementById('btnPause').style.display = 'none';
    document.getElementById('btnResume').style.display = 'inline-flex';
    updateSimBadge('Paused', 'warning');
}

// Resume
function resumeSimulation() {
    if (!simulationResult) return;
    isPlaying = true;
    document.getElementById('btnResume').style.display = 'none';
    document.getElementById('btnPause').style.display = 'inline-flex';
    updateSimBadge('Running', 'primary');

    clearInterval(playInterval);
    playInterval = setInterval(stepLoop, stepDuration);
}

// Reset
async function resetSimulation() {
    isPlaying = false;
    clearInterval(playInterval);
    currentStepIndex = -1;
    simulationResult = null;

    document.getElementById('btnStart').style.display = 'inline-flex';
    document.getElementById('btnPause').style.display = 'none';
    document.getElementById('btnResume').style.display = 'none';
    document.getElementById('summaryCard').style.display = 'none';
    document.getElementById('stepCounterBadge').textContent = 'Step 0 / 0';
    document.getElementById('panelTimeTag').textContent = 'Time 0–0';
    document.getElementById('panelAgentTag').textContent = 'Awaiting Start';
    document.getElementById('explanationText').textContent = 'Simulation reset. Ready to run Round Robin scheduling.';
    document.getElementById('metricTimeSlice').textContent = '-';
    document.getElementById('metricRemaining').textContent = '-';
    document.getElementById('metricAction').textContent = '-';
    document.getElementById('timelineLogBox').innerHTML = `
        <div class="timeline-log-entry text-muted">
            <span class="timeline-time-tag">Time --:</span>
            <span>Simulation reset. Ready to begin.</span>
        </div>
    `;
    document.getElementById('logCountBadge').textContent = '0 events';
    document.getElementById('ganttBar').innerHTML = '<div class="d-flex align-items-center justify-content-center text-muted small w-100">Timeline reset.</div>';
    document.getElementById('ganttTicks').innerHTML = '';

    updateSimBadge('Ready', 'secondary');

    try {
        await fetch('/api/simulation/reset', { method: 'POST' });
        loadInitialData();
    } catch (err) {
        console.warn('Backend reset notification:', err);
    }
}

// Finish
function finishSimulation() {
    isPlaying = false;
    clearInterval(playInterval);
    document.getElementById('btnPause').style.display = 'none';
    document.getElementById('btnResume').style.display = 'none';
    document.getElementById('btnStart').style.display = 'inline-flex';
    document.getElementById('btnStart').innerHTML = '<i class="bi bi-arrow-repeat me-1"></i> Restart Simulation';
    updateSimBadge('Completed', 'success');

    // Show final summary and viva metrics
    renderSummary();
    showToast('Round Robin scheduling finished! Viva metrics calculated below.', 'success');
}

// ================= RENDER A SINGLE SIMULATION STEP =================
function renderStep(step) {
    if (!step) return;

    const totalSteps = simulationResult.steps.length;
    document.getElementById('stepCounterBadge').textContent = `Step ${step.stepNumber} of ${totalSteps}`;

    // 1. Render Ready Queue (Show queue before this turn with front element highlighted)
    renderQueueAtStep(step);

    // 2. Render Agent States
    renderAgentsAtStep(step);

    // 3. Render Explanation Panel
    renderExplanation(step);

    // 4. Append to Live Timeline Log
    appendTimelineLog(step);

    // 5. Update Gantt Timeline Chart
    updateGanttChart(step);
}

// Render Ready Queue Cards
function renderQueueAtStep(step) {
    const track = document.getElementById('queueTrack');
    const badge = document.getElementById('queueCountBadge');

    // The ready queue currently waiting behind the front query
    const remainingQueue = step.readyQueueBefore || [];
    badge.textContent = `${remainingQueue.length} Queries in Queue`;

    // Render cards: First card is the active query being processed
    let html = '';

    // Active Query Card (currently dispatched to agent)
    html += `
        <div class="queue-card active-head" style="border-top: 4px solid ${step.queryColor || '#2563eb'};">
            <div class="queue-card-header">
                <span class="badge" style="background-color: ${step.queryColor || '#2563eb'}; color: white;">
                    ${escapeHtml(step.queryId)}
                </span>
                <span class="badge badge-status badge-in-progress">
                    <i class="bi bi-cpu"></i> In Service
                </span>
            </div>
            <h6 class="queue-card-title">${escapeHtml(step.customerName)}</h6>
            <div class="queue-card-desc">${escapeHtml(step.queryDescription)}</div>
            <div class="queue-card-times">
                <span>Remaining:</span>
                <span class="time-badge text-primary fw-bold">${step.remainingTimeAfter} units</span>
            </div>
            <div class="progress" style="height: 6px;">
                <div class="progress-bar bg-warning progress-bar-striped progress-bar-animated" style="width: 100%;"></div>
            </div>
            <small class="text-primary mt-2 d-block fw-semibold" style="font-size: 0.72rem;">
                <i class="bi bi-arrow-right-circle"></i> With ${escapeHtml(step.agentName)}
            </small>
        </div>
    `;

    // Rest of the waiting queries
    remainingQueue.forEach(q => {
        html += `
            <div class="queue-card">
                <div class="queue-card-header">
                    <span class="badge" style="background-color: ${q.color || '#2563eb'}; color: white;">
                        ${escapeHtml(q.id)}
                    </span>
                    <span class="badge badge-status badge-pending">Waiting</span>
                </div>
                <h6 class="queue-card-title">${escapeHtml(q.customerName)}</h6>
                <div class="queue-card-desc">${escapeHtml(q.queryDescription)}</div>
                <div class="queue-card-times">
                    <span>Remaining:</span>
                    <span class="time-badge text-dark">${q.remainingTime} units</span>
                </div>
                <div class="progress" style="height: 6px;">
                    <div class="progress-bar bg-primary" style="width: ${Math.round((q.remainingTime / q.estimatedTime) * 100)}%;"></div>
                </div>
            </div>
        `;
    });

    if (remainingQueue.length === 0 && step.isCompleted) {
        html += `
            <div class="text-success small fw-semibold py-3 px-2">
                <i class="bi bi-check-circle-fill me-1"></i> Queue will be empty after this step!
            </div>
        `;
    }

    track.innerHTML = html;
}

// Render Agent Cards at Step
function renderAgentsAtStep(step) {
    const row = document.getElementById('simAgentsRow');
    const agents = step.agentStates || [];

    row.innerHTML = agents.map(agent => {
        const isActive = (agent.id === step.agentId);
        const initial = agent.name ? agent.name.charAt(0).toUpperCase() : 'A';
        const color = agent.avatarColor || '#2563eb';

        const statusBadge = isActive 
            ? '<span class="badge badge-status badge-busy"><i class="bi bi-broadcast"></i> Serving Now</span>'
            : '<span class="badge badge-status badge-available"><i class="bi bi-check-circle"></i> Idle</span>';

        return `
            <div class="col-md-6 col-lg-4">
                <div class="agent-card ${isActive ? 'agent-active' : ''}">
                    <div class="d-flex align-items-center gap-3 mb-2">
                        <div class="agent-avatar" style="background-color: ${color};">
                            ${initial}
                        </div>
                        <div>
                            <h6 class="fw-bold mb-0 text-dark">${escapeHtml(agent.name)}</h6>
                            <small class="text-muted font-monospace">${escapeHtml(agent.id)}</small>
                        </div>
                        <div class="ms-auto">
                            ${statusBadge}
                        </div>
                    </div>

                    <div class="p-2 bg-light rounded-3 small mb-2">
                        <div class="d-flex justify-content-between text-secondary mb-1">
                            <span>Serving:</span>
                            <strong class="${isActive ? 'text-primary' : 'text-dark'}">
                                ${escapeHtml(agent.currentCustomer || 'None (Idle)')}
                            </strong>
                        </div>
                        <div class="d-flex justify-content-between text-secondary mb-1">
                            <span>Time Slice Used:</span>
                            <span class="badge bg-white text-dark border font-monospace">
                                ${isActive ? `${step.timeSpentInStep} units` : '0 units'}
                            </span>
                        </div>
                        <div class="progress" style="height: 7px;">
                            <div class="progress-bar ${isActive ? 'bg-primary progress-bar-striped progress-bar-animated' : 'bg-secondary'}" 
                                 style="width: ${isActive ? '100%' : '0%'};">
                            </div>
                        </div>
                    </div>

                    <div class="d-flex justify-content-between text-muted small">
                        <span><i class="bi bi-check2-all text-success me-1"></i> Turns: <strong>${agent.queriesHandled || 0}</strong></span>
                        <span>Total Busy: <strong>${agent.totalTimeSpent || 0}</strong> units</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Render Explanation
function renderExplanation(step) {
    document.getElementById('panelTimeTag').textContent = `Time ${step.startTime}–${step.endTime}`;
    document.getElementById('panelAgentTag').textContent = `${step.agentName} &bull; ${step.customerName}`;
    document.getElementById('explanationText').textContent = step.explanation;

    document.getElementById('metricTimeSlice').textContent = `${step.timeSpentInStep} units`;
    document.getElementById('metricRemaining').textContent = `${step.remainingTimeAfter} units`;

    const actionBadge = document.getElementById('metricAction');
    if (step.isCompleted) {
        actionBadge.innerHTML = '<span class="text-success fw-bold"><i class="bi bi-check-circle"></i> COMPLETED</span>';
    } else {
        actionBadge.innerHTML = '<span class="text-warning fw-bold"><i class="bi bi-arrow-repeat"></i> REQUEUED</span>';
    }
}

// Append Timeline Log Entry
function appendTimelineLog(step) {
    const box = document.getElementById('timelineLogBox');
    const badge = document.getElementById('logCountBadge');

    const statusBadge = step.isCompleted
        ? '<span class="badge bg-success"><i class="bi bi-check"></i> Completed</span>'
        : `<span class="badge bg-primary">Rem: ${step.remainingTimeAfter}</span>`;

    const entryHtml = `
        <div class="timeline-log-entry" id="log-step-${step.stepNumber}">
            <span class="timeline-time-tag">Time ${step.startTime}–${step.endTime}:</span>
            <div>
                <strong>${escapeHtml(step.customerName)}'s</strong> ${escapeHtml(step.queryDescription)} 
                <span class="text-muted">&rarr;</span> 
                <span class="text-info">${escapeHtml(step.agentName)}</span>
                ${statusBadge}
            </div>
        </div>
    `;

    box.insertAdjacentHTML('beforeend', entryHtml);
    badge.textContent = `${step.stepNumber} events`;
    box.scrollTop = box.scrollHeight;
}

// Update Gantt Timeline Chart
function updateGanttChart(step) {
    const bar = document.getElementById('ganttBar');
    const totalSimTime = simulationResult.totalSimulationTime || 1;

    // Remove placeholder if present
    if (step.stepNumber === 1) {
        bar.innerHTML = '';
        document.getElementById('ganttTicks').innerHTML = '';
    }

    const duration = step.endTime - step.startTime;
    const widthPercent = (duration / totalSimTime) * 100;

    const sliceHtml = `
        <div class="gantt-slice" 
             style="width: ${widthPercent}%; background-color: ${step.queryColor || '#2563eb'};"
             title="${escapeHtml(step.customerName)} (${step.startTime}-${step.endTime}) with ${escapeHtml(step.agentName)}">
            <span>${escapeHtml(step.queryId)}</span>
            <small style="font-size: 0.65rem; opacity: 0.85;">${step.startTime}-${step.endTime}</small>
        </div>
    `;

    bar.insertAdjacentHTML('beforeend', sliceHtml);
}

// Render Summary and Viva Performance Metrics
function renderSummary() {
    if (!simulationResult) return;

    const card = document.getElementById('summaryCard');
    card.style.display = 'block';

    document.getElementById('sumTotalQueries').textContent = simulationResult.totalQueries;
    document.getElementById('sumTotalSimTime').textContent = `${simulationResult.totalSimulationTime} units`;
    document.getElementById('sumTotalTurns').textContent = simulationResult.totalTurns;
    document.getElementById('sumAvgWT').textContent = `${simulationResult.averageWaitingTime} units`;
    document.getElementById('sumAvgTAT').textContent = `${simulationResult.averageTurnaroundTime} units`;

    // 1. Query Performance Table
    const summaryTbody = document.getElementById('summaryTableBody');
    const queries = simulationResult.queryDetails || [];

    summaryTbody.innerHTML = queries.map(q => `
        <tr>
            <td class="fw-bold font-monospace text-primary">${escapeHtml(q.id)}</td>
            <td class="fw-semibold">${escapeHtml(q.customerName)}</td>
            <td class="text-secondary small">${escapeHtml(q.queryDescription)}</td>
            <td class="font-monospace text-center">${q.arrivalTime}</td>
            <td class="font-monospace text-center">${q.estimatedTime}</td>
            <td class="font-monospace text-center fw-bold text-dark">${q.completionTime}</td>
            <td class="font-monospace text-center fw-bold text-primary">${q.turnaroundTime} units</td>
            <td class="font-monospace text-center fw-bold text-success">${q.waitingTime} units</td>
        </tr>
    `).join('');

    // 2. Agent Workload Breakdown Table
    const agentTbody = document.getElementById('agentWorkloadTableBody');
    const agents = simulationResult.agentWorkloads || [];
    const totalSimTime = simulationResult.totalSimulationTime || 1;

    agentTbody.innerHTML = agents.map(a => {
        const sharePercent = Math.round(((a.totalTimeSpent || 0) / totalSimTime) * 100);
        return `
            <tr>
                <td class="fw-bold font-monospace text-info">${escapeHtml(a.id)}</td>
                <td class="fw-semibold">
                    <span class="d-inline-block rounded-circle me-1" style="width: 10px; height: 10px; background-color: ${a.avatarColor || '#2563eb'};"></span>
                    ${escapeHtml(a.name)}
                </td>
                <td class="font-monospace text-center">${a.queriesHandled || 0} turns</td>
                <td class="font-monospace text-center">${a.totalTimeSpent || 0} units</td>
                <td>
                    <div class="d-flex align-items-center gap-2">
                        <div class="progress flex-grow-1" style="height: 8px;">
                            <div class="progress-bar bg-info" style="width: ${sharePercent}%;"></div>
                        </div>
                        <span class="small font-monospace fw-bold">${sharePercent}%</span>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    // Smooth scroll down to summary card
    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Utility: update status badge in hero
function updateSimBadge(text, bgClass) {
    const badge = document.getElementById('simStatusBadge');
    if (!badge) return;
    badge.className = `badge bg-${bgClass} text-white px-3 py-2 fs-6 shadow-sm`;
    badge.innerHTML = `<i class="bi bi-circle-fill me-1" style="font-size: 0.65rem;"></i> ${text}`;
}

// Toast helper
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toastId = 'toast_' + Date.now();
    const bgClass = type === 'success' ? 'bg-success text-white' :
                    type === 'danger' ? 'bg-danger text-white' : 
                    type === 'warning' ? 'bg-warning text-dark' : 'bg-primary text-white';

    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center ${bgClass} border-0 shadow-lg" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="bi bi-info-circle-fill me-2"></i> ${escapeHtml(message)}
                </div>
                <button type="button" class="btn-close ${type === 'warning' ? '' : 'btn-close-white'} me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
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
