/**
 * Parent AI Agent - Core Management System
 * Oversees creation, deployment, and management of child agents
 */

class ParentAI {
    constructor(config = {}) {
        this.id = 'parent-ai-001';
        this.status = 'active';
        this.childAgents = [];
        this.actionCount = 0;
        this.workload = 0;
        
        // Configuration with defaults
        this.config = {
            maxChildAgents: config.maxChildAgents || 10,
            multiplicationThreshold: config.multiplicationThreshold || 70,
            autoMultiply: config.autoMultiply !== undefined ? config.autoMultiply : true,
            evaluationInterval: config.evaluationInterval || 3000, // ms
            ...config
        };

        // Ethical boundaries and safeguards
        this.ethicalLimits = {
            maxActionsPerMinute: 100,
            requireUserApproval: false,
            logAllActions: true,
            preventDuplicateRoles: true
        };

        // Agent role definitions
        this.availableRoles = [
            { 
                name: 'Market Analyst', 
                description: 'Analyzes market trends and patterns',
                workloadImpact: 15 
            },
            { 
                name: 'Trading Assistant', 
                description: 'Provides trading recommendations',
                workloadImpact: 20 
            },
            { 
                name: 'Risk Manager', 
                description: 'Monitors and manages trading risks',
                workloadImpact: 10 
            },
            { 
                name: 'Portfolio Optimizer', 
                description: 'Optimizes portfolio allocation',
                workloadImpact: 15 
            },
            { 
                name: 'News Monitor', 
                description: 'Tracks crypto news and events',
                workloadImpact: 12 
            },
            { 
                name: 'Technical Analyst', 
                description: 'Performs technical analysis',
                workloadImpact: 18 
            },
            { 
                name: 'Sentiment Analyzer', 
                description: 'Analyzes market sentiment',
                workloadImpact: 13 
            },
            { 
                name: 'UX Customizer', 
                description: 'Personalizes user experience',
                workloadImpact: 8 
            }
        ];

        this.activityLog = [];
        this.startTime = Date.now();
        
        this.log('Parent AI initialized', 'info');
        this.startEvaluationLoop();
    }

    /**
     * Evaluate workload and decide whether to create new child agents
     */
    evaluateWorkload() {
        // Simulate workload calculation based on various factors
        const baseLoad = Math.min(100, this.childAgents.length * 8);
        const randomVariation = Math.random() * 20;
        this.workload = Math.min(100, baseLoad + randomVariation);

        // Check if multiplication is needed
        if (this.config.autoMultiply && 
            this.workload > this.config.multiplicationThreshold &&
            this.childAgents.length < this.config.maxChildAgents) {
            
            this.createChildAgent();
        }

        // Occasionally reduce workload by optimizing agents
        if (Math.random() < 0.1 && this.workload > 50) {
            this.optimizeAgents();
        }

        return this.workload;
    }

    /**
     * Create a new child agent with a specific role
     */
    createChildAgent(roleIndex = null) {
        if (this.childAgents.length >= this.config.maxChildAgents) {
            this.log('Maximum child agents reached', 'warning');
            return null;
        }

        // Select role
        let role;
        if (roleIndex !== null && roleIndex < this.availableRoles.length) {
            role = this.availableRoles[roleIndex];
        } else {
            // Prevent duplicate roles if configured
            if (this.config.preventDuplicateRoles) {
                const usedRoles = this.childAgents.map(agent => agent.role.name);
                const availableRoles = this.availableRoles.filter(r => !usedRoles.includes(r.name));
                
                if (availableRoles.length === 0) {
                    role = this.availableRoles[Math.floor(Math.random() * this.availableRoles.length)];
                } else {
                    role = availableRoles[Math.floor(Math.random() * availableRoles.length)];
                }
            } else {
                role = this.availableRoles[Math.floor(Math.random() * this.availableRoles.length)];
            }
        }

        const childAgent = new ChildAgent(this.childAgents.length + 1, role, this);
        this.childAgents.push(childAgent);
        
        this.actionCount++;
        this.log(`Created child agent: ${childAgent.name} (${role.name})`, 'success');
        
        return childAgent;
    }

    /**
     * Remove a child agent
     */
    removeChildAgent(agentId) {
        const index = this.childAgents.findIndex(agent => agent.id === agentId);
        
        if (index !== -1) {
            const agent = this.childAgents[index];
            agent.terminate();
            this.childAgents.splice(index, 1);
            
            this.actionCount++;
            this.log(`Removed child agent: ${agent.name}`, 'info');
            return true;
        }
        
        return false;
    }

    /**
     * Optimize existing agents for better performance
     */
    optimizeAgents() {
        this.childAgents.forEach(agent => {
            if (agent.status === 'active') {
                agent.optimize();
            }
        });
        
        this.workload = Math.max(0, this.workload - 15);
        this.log('Optimized child agents', 'info');
    }

    /**
     * Reset the entire system
     */
    reset() {
        // Terminate all child agents
        this.childAgents.forEach(agent => agent.terminate());
        this.childAgents = [];
        
        this.workload = 0;
        this.actionCount = 0;
        
        this.log('System reset complete', 'warning');
    }

    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.log('Configuration updated', 'info');
    }

    /**
     * Log activity with timestamp
     */
    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = {
            timestamp,
            message,
            type,
            time: Date.now()
        };
        
        this.activityLog.push(logEntry);
        
        // Keep log size manageable
        if (this.activityLog.length > 100) {
            this.activityLog.shift();
        }
        
        // Emit event for UI update
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('parentai-log', { detail: logEntry }));
        }
    }

    /**
     * Start continuous evaluation loop
     */
    startEvaluationLoop() {
        setInterval(() => {
            this.evaluateWorkload();
            
            // Update UI
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('parentai-update', {
                    detail: {
                        workload: this.workload,
                        childCount: this.childAgents.length,
                        actionCount: this.actionCount
                    }
                }));
            }
        }, this.config.evaluationInterval);
    }

    /**
     * Get system status
     */
    getStatus() {
        return {
            id: this.id,
            status: this.status,
            workload: this.workload,
            childAgents: this.childAgents.length,
            actionCount: this.actionCount,
            config: this.config,
            uptime: Date.now() - this.startTime
        };
    }

    /**
     * Get child agent by ID
     */
    getChildAgent(agentId) {
        return this.childAgents.find(agent => agent.id === agentId);
    }

    /**
     * Get all child agents
     */
    getChildAgents() {
        return this.childAgents;
    }

    /**
     * Get activity log
     */
    getActivityLog() {
        return this.activityLog;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ParentAI;
}
