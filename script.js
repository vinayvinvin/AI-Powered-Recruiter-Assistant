// Global state management
const state = {
    currentReq: {
        id: 'frontend-azure-001',
        title: 'Senior Frontend Engineer - Azure Portal Team',
        applications: 523,
        screened: 347,
        criteria: {
            technical: 40,
            experience: 25,
            growth: 20,
            culture: 15
        }
    },
    candidates: [
        {
            id: 'sarah',
            name: 'Sarah Kim',
            score: 94,
            summary: '6yr React + startup experience, team lead at Airbnb',
            status: 'approved',
            tier: 'top'
        },
        {
            id: 'mike',
            name: 'Mike Rodriguez',
            score: 92,
            summary: 'MS intern → senior engineer, strong algorithmic background',
            status: 'approved',
            tier: 'top'
        },
        {
            id: 'lisa',
            name: 'Lisa Wang',
            score: 89,
            summary: 'Career changer + bootcamp, impressive portfolio projects',
            status: 'pending',
            tier: 'top'
        }
    ],
    diversity: {
        womenShortlist: 42,
        womenPool: 38,
        urShortlist: 23,
        urPool: 31
    }
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventHandlers();
    updateProgress();
    simulateRealTimeUpdates();
});

function initializeEventHandlers() {
    // Navigation handlers
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', handleNavigation);
    });

    // Modal handlers
    document.addEventListener('click', handleGlobalClick);
    
    // Criteria range inputs
    document.querySelectorAll('input[type="range"]').forEach(input => {
        input.addEventListener('input', updateCriteriaWeight);
    });

    // Candidate action buttons
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', handleCandidateAction);
    });
}

function handleNavigation(event) {
    const target = event.target.dataset.view;
    
    // Update active navigation
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Show appropriate content (for prototype, we'll just show dashboard)
    if (target !== 'dashboard') {
        showToast('Feature coming soon!');
    }
}

function handleGlobalClick(event) {
    // Close modals when clicking outside
    if (event.target.classList.contains('modal')) {
        closeAllModals();
    }
}

// Criteria Setup Functions
function showCriteriaSetup() {
    const modal = document.getElementById('criteriaModal');
    modal.classList.add('show');
    
    // Update sliders with current values
    Object.keys(state.currentReq.criteria).forEach(key => {
        const input = document.getElementById(key);
        if (input) {
            input.value = state.currentReq.criteria[key];
            updateWeightDisplay(input);
        }
    });
}

function closeCriteriaSetup() {
    document.getElementById('criteriaModal').classList.remove('show');
}

function updateCriteriaWeight(event) {
    const input = event.target;
    const value = parseInt(input.value);
    const criterionName = input.id;
    
    // Update state
    state.currentReq.criteria[criterionName] = value;
    
    // Update display
    updateWeightDisplay(input);
    
    // Recalculate other weights to ensure they total 100%
    balanceCriteriaWeights(criterionName);
}

function updateWeightDisplay(input) {
    const weightDisplay = input.parentElement.querySelector('.weight-value');
    weightDisplay.textContent = input.value + '%';
}

function balanceCriteriaWeights(changedCriterion) {
    const criteria = state.currentReq.criteria;
    const totalOther = Object.keys(criteria)
        .filter(key => key !== changedCriterion)
        .reduce((sum, key) => sum + criteria[key], 0);
    
    const newTotal = criteria[changedCriterion] + totalOther;
    
    if (newTotal !== 100) {
        const adjustment = (100 - criteria[changedCriterion]) / totalOther;
        Object.keys(criteria)
            .filter(key => key !== changedCriterion)
            .forEach(key => {
                criteria[key] = Math.round(criteria[key] * adjustment);
                const input = document.getElementById(key);
                if (input) {
                    input.value = criteria[key];
                    updateWeightDisplay(input);
                }
            });
    }
}

function saveCriteria() {
    // Show loading state
    const button = event.target;
    button.textContent = 'Saving...';
    button.disabled = true;
    
    setTimeout(() => {
        closeCriteriaSetup();
        showToast('✓ Criteria saved! AI screening resumed with updated parameters.');
        button.textContent = 'Save Criteria & Start Screening';
        button.disabled = false;
        
        // Trigger progress update
        simulateScreeningProgress();
    }, 1500);
}

// Shortlist Review Functions
function showShortlist() {
    const modal = document.getElementById('shortlistModal');
    modal.classList.add('show');
    
    // Update candidate cards with current state
    updateCandidateCards();
    updateDiversityStats();
}

function closeShortlist() {
    document.getElementById('shortlistModal').classList.remove('show');
}

function updateCandidateCards() {
    state.candidates.forEach(candidate => {
        const card = document.querySelector(`[data-candidate="${candidate.id}"]`);
        if (card) {
            // Update approval status
            const buttons = card.querySelectorAll('.action-btn');
            buttons.forEach(btn => btn.classList.remove('active', 'approved', 'neutral'));
            
            if (candidate.status === 'approved') {
                buttons[0].classList.add('approved');
            } else if (candidate.status === 'pending') {
                buttons[1].classList.add('neutral', 'active');
            }
        }
    });
}

function updateDiversityStats() {
    const diversitySection = document.querySelector('.diversity-stats');
    const stats = state.diversity;
    
    const womenStat = diversitySection.children[0];
    const urStat = diversitySection.children[1];
    
    // Update women representation
    const womenValue = womenStat.querySelector('.value');
    womenValue.textContent = `${stats.womenShortlist}% women (vs ${stats.womenPool}% applicant pool)`;
    womenValue.className = stats.womenShortlist >= stats.womenPool - 2 ? 'value good' : 'value warning';
    
    // Update underrepresented minorities
    const urValue = urStat.querySelector('.value');
    urValue.textContent = `${stats.urShortlist}% (vs ${stats.urPool}% applicant pool)`;
    urValue.className = stats.urShortlist >= stats.urPool - 5 ? 'value good' : 'value warning';
}

function handleCandidateAction(event) {
    const button = event.target;
    const card = button.closest('.candidate-card');
    const candidateId = card.dataset.candidate;
    const candidate = state.candidates.find(c => c.id === candidateId);
    
    if (!candidate) return;
    
    // Determine action based on button index
    const buttons = card.querySelectorAll('.action-btn');
    const buttonIndex = Array.from(buttons).indexOf(button);
    
    // Reset all buttons
    buttons.forEach(btn => btn.classList.remove('active', 'approved', 'neutral'));
    
    switch (buttonIndex) {
        case 0: // Approve
            candidate.status = 'approved';
            button.classList.add('approved');
            showFeedback('✓ Candidate approved for interview');
            break;
        case 1: // Hold/Review
            candidate.status = 'pending';
            button.classList.add('neutral', 'active');
            showFeedback('? Candidate marked for further review');
            break;
        case 2: // Reject
            candidate.status = 'rejected';
            card.style.opacity = '0.5';
            showFeedback('× Candidate moved to rejected list');
            break;
    }
    
    updateDiversityAfterAction();
}

function updateDiversityAfterAction() {
    // Simulate diversity impact of decisions
    const approvedCount = state.candidates.filter(c => c.status === 'approved').length;
    
    if (approvedCount > 0) {
        // Slightly adjust diversity metrics based on decisions
        state.diversity.womenShortlist = Math.min(45, state.diversity.womenShortlist + 1);
        state.diversity.urShortlist = Math.max(20, state.diversity.urShortlist - 1);
        updateDiversityStats();
    }
}

function finalizeShortlist() {
    const approvedCandidates = state.candidates.filter(c => c.status === 'approved');
    
    if (approvedCandidates.length === 0) {
        showToast('⚠️ Please approve at least one candidate before finalizing.');
        return;
    }
    
    // Show confirmation
    const confirmed = confirm(`Send ${approvedCandidates.length} candidates to Hiring Manager for review?`);
    
    if (confirmed) {
        closeShortlist();
        showSuccessMessage(`🎉 Shortlist sent! ${approvedCandidates.length} candidates forwarded to Hiring Manager.`);
        
        // Update dashboard stats
        setTimeout(updateSuccessMetrics, 1000);
    }
}

// Progress and Animation Functions
function updateProgress() {
    const progressBar = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');
    
    const percentage = (state.currentReq.screened / state.currentReq.applications) * 100;
    
    progressBar.style.width = percentage + '%';
    progressText.textContent = `${state.currentReq.screened} of ${state.currentReq.applications} applications screened`;
}

function simulateRealTimeUpdates() {
    // Simulate ongoing screening progress
    setInterval(() => {
        if (state.currentReq.screened < state.currentReq.applications) {
            state.currentReq.screened += Math.floor(Math.random() * 3) + 1;
            updateProgress();
            
            // Update time remaining
            const remaining = state.currentReq.applications - state.currentReq.screened;
            const timeRemaining = Math.max(0.1, (remaining / 100)).toFixed(1);
            
            const timeElement = document.querySelector('.req-stat .value');
            if (timeElement && timeElement.textContent.includes('hours')) {
                timeElement.textContent = `${timeRemaining} hours`;
            }
        }
    }, 3000);
}

function simulateScreeningProgress() {
    // Accelerate screening when criteria are updated
    const interval = setInterval(() => {
        state.currentReq.screened += Math.floor(Math.random() * 8) + 5;
        
        if (state.currentReq.screened >= state.currentReq.applications) {
            state.currentReq.screened = state.currentReq.applications;
            clearInterval(interval);
            showToast('🎯 Screening complete! All candidates processed.');
        }
        
        updateProgress();
    }, 1000);
}

function updateSuccessMetrics() {
    // Animate stat cards with improved metrics
    const statCards = document.querySelectorAll('.stat-card h3');
    
    // Time saved
    animateNumber(statCards[0], '25.7 hours');
    
    // Accuracy
    animateNumber(statCards[1], '91%');
    
    // Success rate
    animateNumber(statCards[2], '14/16');
    
    // Throughput
    animateNumber(statCards[3], '+52%');
}

function animateNumber(element, newValue) {
    element.style.color = 'var(--success-color)';
    element.style.transform = 'scale(1.1)';
    
    setTimeout(() => {
        element.textContent = newValue;
        element.style.transform = 'scale(1)';
    }, 300);
    
    setTimeout(() => {
        element.style.color = 'var(--primary-color)';
    }, 1000);
}

// Utility Functions
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('show');
    });
}

function showToast(message) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--surface-color);
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius);
        padding: var(--spacing-md);
        box-shadow: var(--shadow-medium);
        z-index: 1100;
        max-width: 300px;
        animation: slideIn 0.3s ease;
    `;
    
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Add slide-in animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => {
            document.body.removeChild(toast);
            document.head.removeChild(style);
        }, 300);
    }, 3000);
}

function showFeedback(message) {
    // Show brief feedback for candidate actions
    const feedback = document.createElement('div');
    feedback.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--text-primary);
        color: white;
        padding: var(--spacing-md) var(--spacing-lg);
        border-radius: var(--border-radius);
        z-index: 1100;
        font-size: 14px;
        opacity: 0.9;
    `;
    
    feedback.textContent = message;
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        document.body.removeChild(feedback);
    }, 2000);
}

function showSuccessMessage(message) {
    const success = document.createElement('div');
    success.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--success-color);
        color: white;
        padding: var(--spacing-xl);
        border-radius: var(--border-radius);
        z-index: 1200;
        font-size: 18px;
        font-weight: 600;
        text-align: center;
        box-shadow: var(--shadow-large);
        min-width: 300px;
    `;
    
    success.textContent = message;
    document.body.appendChild(success);
    
    setTimeout(() => {
        document.body.removeChild(success);
    }, 4000);
}

// Keyboard navigation
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeAllModals();
    }
});

// Add expand section functionality
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('expand-section')) {
        event.target.textContent = 'Loading review zone candidates...';
        event.target.disabled = true;
        
        setTimeout(() => {
            event.target.textContent = '✓ 23 candidates loaded for review';
            showToast('Review zone candidates are now available for detailed evaluation.');
        }, 1500);
    }
});

// Simulate AI insights
function showAIInsight() {
    const insights = [
        "💡 Tip: Lisa Wang shows strong portfolio projects despite non-traditional background",
        "🔍 Pattern detected: Candidates with startup experience show 23% higher performance",
        "📊 This role typically sees 15% higher success with remote work experience",
        "⚡ Fast-track suggestion: 3 candidates match your previous successful hires"
    ];
    
    const randomInsight = insights[Math.floor(Math.random() * insights.length)];
    showToast(randomInsight);
}

// Show AI insight periodically
setInterval(showAIInsight, 15000);