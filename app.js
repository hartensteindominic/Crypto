/**
 * Main Application - Initialize and coordinate all systems
 */

// Global instances
let parentAI;
let liquidAnimation;

/**
 * Initialize the application
 */
function initializeApp() {
    console.log('Initializing Crypto AI Agent System...');

    // Create Parent AI with initial configuration
    const config = {
        maxChildAgents: 10,
        multiplicationThreshold: 70,
        autoMultiply: true,
        evaluationInterval: 3000
    };

    parentAI = new ParentAI(config);

    // Initialize UI Controller
    uiController = new UIController(parentAI);

    // Load initial settings from UI
    syncConfigFromUI();

    // Create initial child agents for demonstration
    setTimeout(() => {
        if (parentAI.childAgents.length === 0) {
            parentAI.createChildAgent(0); // Market Analyst
            setTimeout(() => {
                parentAI.createChildAgent(7); // UX Customizer
            }, 1000);
        }
    }, 2000);

    // Set up periodic status updates
    setInterval(() => {
        updateSystemStatus();
    }, 5000);

    console.log('Crypto AI Agent System initialized successfully!');
}

/**
 * Sync configuration from UI inputs
 */
function syncConfigFromUI() {
    const maxAgents = parseInt(document.getElementById('max-agents').value);
    const threshold = parseInt(document.getElementById('multiplication-threshold').value);
    const autoMultiply = document.getElementById('auto-multiply').checked;

    parentAI.updateConfig({
        maxChildAgents: maxAgents,
        multiplicationThreshold: threshold,
        autoMultiply: autoMultiply
    });
}

/**
 * Update system status display
 */
function updateSystemStatus() {
    const status = parentAI.getStatus();
    
    // Log periodic status (only if significant changes)
    if (Math.random() < 0.2) { // 20% chance to avoid log spam
        const statusMessage = `System Status: ${status.childAgents} agents, ${Math.round(status.workload)}% workload`;
        console.log(statusMessage);
    }

    // Check for high workload warning
    if (status.workload > 90 && status.childAgents < status.config.maxChildAgents) {
        if (Math.random() < 0.3) {
            parentAI.log('High workload detected - system may create additional agents', 'warning');
        }
    }

    // Check if at maximum capacity
    if (status.childAgents >= status.config.maxChildAgents && status.workload > 80) {
        if (Math.random() < 0.1) {
            parentAI.log('At maximum agent capacity - consider increasing limits', 'warning');
        }
    }
}

/**
 * Export system data for analysis
 */
function exportSystemData() {
    const data = {
        timestamp: new Date().toISOString(),
        parentAI: parentAI.getStatus(),
        childAgents: parentAI.getChildAgents().map(agent => agent.getStatus()),
        activityLog: parentAI.getActivityLog()
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-agent-system-${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    parentAI.log('System data exported', 'info');
}

/**
 * Demonstrate agent communication
 */
function demonstrateAgentCommunication() {
    const agents = parentAI.getChildAgents();
    
    if (agents.length < 2) {
        alert('Need at least 2 agents for communication demonstration');
        return;
    }

    const agent1 = agents[0];
    const agent2 = agents[1];

    if (agent1.communicateWith(agent2)) {
        parentAI.log(`${agent1.name} communicated with ${agent2.name}`, 'success');
        uiController.showNotification('Agent communication successful!', 'success');
    }
}

/**
 * Run system diagnostics
 */
function runDiagnostics() {
    parentAI.log('Running system diagnostics...', 'info');

    const status = parentAI.getStatus();
    const agents = parentAI.getChildAgents();

    // Check system health
    const diagnostics = {
        parentAIStatus: status.status,
        agentCount: agents.length,
        activeAgents: agents.filter(a => a.status === 'active').length,
        averageEfficiency: agents.length > 0 
            ? agents.reduce((sum, a) => sum + a.efficiency, 0) / agents.length 
            : 0,
        uptime: Math.round(status.uptime / 1000),
        actionRate: status.actionCount / (status.uptime / 60000) // actions per minute
    };

    console.log('System Diagnostics:', diagnostics);
    parentAI.log(`Diagnostics complete: ${diagnostics.activeAgents}/${diagnostics.agentCount} agents active, avg efficiency: ${Math.round(diagnostics.averageEfficiency)}%`, 'success');

    return diagnostics;
}

/**
 * Handle errors gracefully
 */
window.addEventListener('error', (event) => {
    console.error('Application error:', event.error);
    if (parentAI) {
        parentAI.log(`Error: ${event.error.message}`, 'error');
    }
});

/**
 * Clean up on page unload
 */
window.addEventListener('beforeunload', () => {
    if (parentAI) {
        console.log('Shutting down AI Agent System...');
    }
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Expose functions for console access
window.aiSystem = {
    parentAI: () => parentAI,
    exportData: exportSystemData,
    diagnostics: runDiagnostics,
    demonstrateCommunication: demonstrateAgentCommunication,
    getStatus: () => parentAI ? parentAI.getStatus() : null
};
