/**
 * UI Controller - Manages all user interface interactions
 */

class UIController {
    constructor(parentAI) {
        this.parentAI = parentAI;
        this.elements = this.initializeElements();
        this.setupEventListeners();
        this.setupCustomEventListeners();
        // Update interval aligned with parent AI evaluation (3 seconds)
        this.updateInterval = setInterval(() => this.updateUI(), 3000);
    }

    /**
     * Initialize DOM element references
     */
    initializeElements() {
        return {
            // Status elements
            workload: document.getElementById('workload'),
            childCount: document.getElementById('child-count'),
            actionCount: document.getElementById('action-count'),
            parentStatus: document.getElementById('parent-status'),

            // Control elements
            maxAgents: document.getElementById('max-agents'),
            multiplicationThreshold: document.getElementById('multiplication-threshold'),
            autoMultiply: document.getElementById('auto-multiply'),
            createAgentBtn: document.getElementById('create-agent-btn'),
            resetBtn: document.getElementById('reset-btn'),

            // Display elements
            agentsGrid: document.getElementById('agents-grid'),
            activityLog: document.getElementById('activity-log'),
            clearLogBtn: document.getElementById('clear-log-btn')
        };
    }

    /**
     * Set up event listeners for user interactions
     */
    setupEventListeners() {
        // Control panel inputs
        this.elements.maxAgents.addEventListener('change', (e) => {
            this.parentAI.updateConfig({ maxChildAgents: parseInt(e.target.value) });
        });

        this.elements.multiplicationThreshold.addEventListener('change', (e) => {
            this.parentAI.updateConfig({ multiplicationThreshold: parseInt(e.target.value) });
        });

        this.elements.autoMultiply.addEventListener('change', (e) => {
            this.parentAI.updateConfig({ autoMultiply: e.target.checked });
        });

        // Buttons
        this.elements.createAgentBtn.addEventListener('click', () => {
            this.parentAI.createChildAgent();
            this.updateAgentsGrid();
        });

        this.elements.resetBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset the system? All child agents will be terminated.')) {
                this.parentAI.reset();
                this.updateAgentsGrid();
            }
        });

        this.elements.clearLogBtn.addEventListener('click', () => {
            this.clearActivityLog();
        });
    }

    /**
     * Set up custom event listeners from Parent AI and Child Agents
     */
    setupCustomEventListeners() {
        window.addEventListener('parentai-update', (e) => {
            this.updateMetrics(e.detail);
        });

        window.addEventListener('parentai-log', (e) => {
            this.addLogEntry(e.detail);
        });

        window.addEventListener('childagent-update', (e) => {
            this.updateAgentsGrid();
        });
    }

    /**
     * Update all UI elements
     */
    updateUI() {
        this.updateMetrics({
            workload: this.parentAI.workload,
            childCount: this.parentAI.childAgents.length,
            actionCount: this.parentAI.actionCount
        });
        
        this.updateAgentsGrid();
    }

    /**
     * Update parent AI metrics display
     */
    updateMetrics(data) {
        if (this.elements.workload) {
            this.elements.workload.textContent = `${Math.round(data.workload)}%`;
            
            // Color code based on workload
            const color = data.workload > 80 ? 'var(--danger-color)' :
                         data.workload > 60 ? 'var(--warning-color)' :
                         'var(--success-color)';
            this.elements.workload.style.color = color;
        }

        if (this.elements.childCount) {
            this.elements.childCount.textContent = data.childCount;
        }

        if (this.elements.actionCount) {
            this.elements.actionCount.textContent = data.actionCount;
        }
    }

    /**
     * Update the child agents grid
     */
    updateAgentsGrid() {
        const grid = this.elements.agentsGrid;
        const agents = this.parentAI.getChildAgents();

        if (agents.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <p>No child agents active. System will create agents based on workload.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = agents.map(agent => {
            const status = agent.getStatus();
            const statusColor = status.status === 'active' ? 'var(--success-color)' :
                               status.status === 'paused' ? 'var(--warning-color)' :
                               'var(--danger-color)';

            return `
                <div class="agent-card" data-agent-id="${status.id}">
                    <div class="agent-header">
                        <span class="agent-name">${status.name}</span>
                        <span class="status-dot" style="background: ${statusColor};"></span>
                    </div>
                    <div class="agent-role">${status.role}</div>
                    <div class="agent-stats">
                        <div class="agent-stat">
                            <span>Tasks:</span>
                            <span>${status.tasksCompleted}</span>
                        </div>
                        <div class="agent-stat">
                            <span>Efficiency:</span>
                            <span>${status.efficiency}%</span>
                        </div>
                        <div class="agent-stat">
                            <span>Uptime:</span>
                            <span>${status.uptime}</span>
                        </div>
                        ${status.currentTask ? `
                        <div class="agent-stat" style="grid-column: 1 / -1; font-size: 0.85rem; color: var(--text-secondary); margin-top: 5px;">
                            <span>Current: ${status.currentTask}</span>
                        </div>
                        ` : ''}
                    </div>
                    <div class="agent-actions">
                        <button class="btn btn-secondary btn-agent" onclick="uiController.pauseAgent('${status.id}')">
                            ${status.status === 'active' ? 'Pause' : 'Resume'}
                        </button>
                        <button class="btn btn-secondary btn-agent" onclick="uiController.removeAgent('${status.id}')">
                            Remove
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Add entry to activity log
     */
    addLogEntry(entry) {
        const log = this.elements.activityLog;
        
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${entry.type}`;
        logEntry.innerHTML = `
            <span class="log-time">${entry.timestamp}</span>
            <span class="log-message">${entry.message}</span>
        `;

        // Insert at the beginning
        if (log.firstChild) {
            log.insertBefore(logEntry, log.firstChild);
        } else {
            log.appendChild(logEntry);
        }

        // Keep only recent entries visible
        const entries = log.querySelectorAll('.log-entry');
        if (entries.length > 50) {
            entries[entries.length - 1].remove();
        }
    }

    /**
     * Clear activity log
     */
    clearActivityLog() {
        this.elements.activityLog.innerHTML = '';
        this.parentAI.log('Activity log cleared', 'info');
        this.parentAI.clearActivityLog();
    }

    /**
     * Pause or resume an agent
     */
    pauseAgent(agentId) {
        const agent = this.parentAI.getChildAgent(agentId);
        if (agent) {
            if (agent.status === 'active') {
                agent.pause();
                this.parentAI.log(`Paused agent: ${agent.name}`, 'info');
            } else if (agent.status === 'paused') {
                agent.resume();
                this.parentAI.log(`Resumed agent: ${agent.name}`, 'info');
            }
            this.updateAgentsGrid();
        }
    }

    /**
     * Remove an agent
     */
    removeAgent(agentId) {
        if (confirm('Are you sure you want to remove this agent?')) {
            this.parentAI.removeChildAgent(agentId);
            this.updateAgentsGrid();
        }
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Simple notification system
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    /**
     * Clean up
     */
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}

// Global reference for inline event handlers
let uiController;
