/**
 * Child AI Agent - Specialized Task Performer
 * Performs modular tasks like market analytics, trading support, etc.
 */

// Task timing constants
const MIN_TASK_INTERVAL = 5000;  // 5 seconds
const MAX_TASK_INTERVAL = 10000; // 10 seconds
const MIN_TASK_DURATION = 2000;  // 2 seconds
const MAX_TASK_DURATION = 3000;  // 3 seconds

class ChildAgent {
    constructor(id, role, parentAI) {
        this.id = `child-agent-${String(id).padStart(3, '0')}`;
        this.name = `${role.name} ${id}`;
        this.role = role;
        this.parentAI = parentAI;
        this.status = 'active';
        this.createdAt = Date.now();
        this.tasksCompleted = 0;
        this.efficiency = 80 + Math.random() * 20; // 80-100%
        this.currentTask = null;

        // Start working
        this.startWorking();
    }

    /**
     * Start performing tasks based on role
     */
    startWorking() {
        this.workInterval = setInterval(() => {
            if (this.status === 'active') {
                this.performTask();
            }
        }, MIN_TASK_INTERVAL + Math.random() * MAX_TASK_INTERVAL);
    }

    /**
     * Perform a task based on the agent's role
     */
    performTask() {
        const tasks = this.getTasksForRole();
        this.currentTask = tasks[Math.floor(Math.random() * tasks.length)];
        
        // Simulate task execution
        setTimeout(() => {
            this.tasksCompleted++;
            
            // Slight efficiency variation
            this.efficiency = Math.min(100, Math.max(60, this.efficiency + (Math.random() - 0.5) * 5));
            
            // Notify parent AI
            this.notifyParent(`completed task: ${this.currentTask}`);
            this.currentTask = null;

            // Emit event for UI update
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('childagent-update', {
                    detail: { agentId: this.id }
                }));
            }
        }, MIN_TASK_DURATION + Math.random() * MAX_TASK_DURATION);
    }

    /**
     * Get tasks specific to this agent's role
     */
    getTasksForRole() {
        const taskMap = {
            'Market Analyst': [
                'Analyzing BTC/USD trends',
                'Evaluating market volatility',
                'Identifying support levels',
                'Tracking volume patterns'
            ],
            'Trading Assistant': [
                'Generating buy signals',
                'Calculating position sizes',
                'Reviewing trade opportunities',
                'Monitoring order execution'
            ],
            'Risk Manager': [
                'Assessing portfolio risk',
                'Calculating stop-loss levels',
                'Monitoring exposure',
                'Evaluating correlation risks'
            ],
            'Portfolio Optimizer': [
                'Rebalancing allocations',
                'Optimizing asset weights',
                'Analyzing diversification',
                'Calculating optimal ratios'
            ],
            'News Monitor': [
                'Scanning crypto news',
                'Tracking regulatory updates',
                'Monitoring social sentiment',
                'Analyzing market events'
            ],
            'Technical Analyst': [
                'Calculating indicators',
                'Identifying chart patterns',
                'Analyzing price action',
                'Evaluating trend strength'
            ],
            'Sentiment Analyzer': [
                'Processing social media data',
                'Analyzing fear & greed index',
                'Tracking community sentiment',
                'Evaluating market psychology'
            ],
            'UX Customizer': [
                'Personalizing dashboard',
                'Optimizing layout',
                'Adjusting color themes',
                'Improving accessibility'
            ]
        };

        return taskMap[this.role.name] || ['Performing general analysis'];
    }

    /**
     * Optimize agent performance
     */
    optimize() {
        this.efficiency = Math.min(100, this.efficiency + 10);
        this.notifyParent('optimized performance');
    }

    /**
     * Pause agent operations
     */
    pause() {
        this.status = 'paused';
        this.notifyParent('paused operations');
    }

    /**
     * Resume agent operations
     */
    resume() {
        this.status = 'active';
        this.notifyParent('resumed operations');
    }

    /**
     * Terminate agent
     */
    terminate() {
        this.status = 'terminated';
        if (this.workInterval) {
            clearInterval(this.workInterval);
        }
        this.notifyParent('terminated');
    }

    /**
     * Communicate with parent AI
     */
    notifyParent(message) {
        if (this.parentAI) {
            // Parent AI can log or respond to child agent messages
            // For now, we'll just track it internally
        }
    }

    /**
     * Interact with other child agents
     */
    communicateWith(otherAgent) {
        if (!otherAgent || otherAgent.status !== 'active') {
            return false;
        }

        // Simulate inter-agent communication
        this.efficiency = Math.min(100, this.efficiency + 2);
        otherAgent.efficiency = Math.min(100, otherAgent.efficiency + 2);
        
        return true;
    }

    /**
     * Get agent status
     */
    getStatus() {
        const uptime = Date.now() - this.createdAt;
        
        return {
            id: this.id,
            name: this.name,
            role: this.role.name,
            status: this.status,
            tasksCompleted: this.tasksCompleted,
            efficiency: Math.round(this.efficiency),
            currentTask: this.currentTask,
            uptime: this.formatUptime(uptime)
        };
    }

    /**
     * Format uptime in human-readable format
     */
    formatUptime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChildAgent;
}
