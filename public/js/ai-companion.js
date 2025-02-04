// public/js/ai-companion.js

class AICompanion {
  constructor() {
    this.currentModule = null;
    this.isTyping = false;
    this.messageQueue = [];
    this.initialize();
  }

  initialize() {
    this.createCompanionElement();
    this.initializeEventListeners();
  }

  createCompanionElement() {
    const companion = document.createElement('div');
    companion.className = 'ai-companion';
    companion.innerHTML = `
      <div class="ai-avatar" id="aiAvatar">
        <div class="ai-status"></div>
        <div class="core">
          <i class="ai-icon">🚀</i>
        </div>
      </div>
      <div class="ai-message" id="aiMessage">
        <div class="message-content"></div>
        <div class="typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    `;
    document.body.appendChild(companion);

    this.avatar = document.getElementById('aiAvatar');
    this.messageBox = document.getElementById('aiMessage');
    this.messageContent = this.messageBox.querySelector('.message-content');
    this.typingIndicator = this.messageBox.querySelector('.typing-indicator');
  }

  initializeEventListeners() {
    this.avatar.addEventListener('click', () => {
      if (this.messageBox.classList.contains("active")) {
        this.messageBox.classList.remove("active");  // Hide AI Message
      } else {
        this.showMessage("Hello! Ready to explore space? 🚀", 4000);
        this.messageBox.classList.add("active");  // Show AI Message
      }
    });
  }

  async showMessage(message, duration = 5000) {
    this.messageQueue.push({ message, duration });
    if (!this.isTyping) {
      this.processMessageQueue();
    }
}

async processMessageQueue() {
    if (this.messageQueue.length === 0) {
        this.isTyping = false;
        this.messageBox.classList.remove('active');
        return;
    }

    this.isTyping = true;
    const { message, duration } = this.messageQueue.shift();

    this.messageBox.classList.add('active');
    this.typingIndicator.style.display = 'flex';
    this.messageContent.textContent = '';

    await new Promise(resolve => setTimeout(resolve, 1000));
    this.typingIndicator.style.display = 'none';

    for (let char of message) {
        this.messageContent.textContent += char;
        await new Promise(resolve => setTimeout(resolve, 30));
    }

    // Add follow-up options dynamically
    if (message.includes("Ready to explore space?")) {
        setTimeout(() => {
            this.messageContent.innerHTML += `
            <br><button class="ai-option" onclick="aiCompanion.sendMessage('Tell me about Space Training')">👨‍🚀 Space Training</button>
            <button class="ai-option" onclick="aiCompanion.sendMessage('What is SharedStars Academy?')">📚 SharedStars?</button>
            <button class="ai-option" onclick="aiCompanion.sendMessage('How do I get started?')">🚀 Get Started</button>
            `;
        }, 2000);
    }

    await new Promise(resolve => setTimeout(resolve, duration));
    this.messageBox.classList.remove('active');
    await new Promise(resolve => setTimeout(resolve, 500));
    this.processMessageQueue();
}


  async provideGuidance(moduleType, action) {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await fetch('/api/ai/guidance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ moduleType, action })
      });
      if (!response.ok) throw new Error('Failed to fetch guidance');
      const guidance = await response.json();
      await this.showMessage(guidance.message);
      if (guidance.nextSteps) {
        await this.showMessage("Here's what to focus on next:", 3000);
        for (let step of guidance.nextSteps) {
          await this.showMessage(`• ${step}`, 4000);
        }
      }
      return guidance;
    } catch (error) {
      console.error('Error providing guidance:', error);
      await this.showMessage("Sorry, I'm having trouble fetching guidance right now.");
      return { error: error.message };
    }
  }

  async celebrateProgress(achievement) {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await fetch('/api/ai/celebrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ achievement })
      });
      if (!response.ok) throw new Error('Failed to celebrate progress');
      const celebration = await response.json();
      await this.showMessage(`🎉 ${celebration.message}`, 5000);
      if (celebration.nextMilestone) {
        await this.showMessage(`Next milestone: ${celebration.nextMilestone}`, 4000);
      }
    } catch (error) {
      console.error('Error celebrating progress:', error);
    }
  }

  async showModuleIntroduction(moduleType) {
    const introMessages = {
      physical: [
        "Welcome to Physical Training! 🏋️‍♂️",
        "We'll focus on building your space-ready physique.",
        "Let's start with the basics of zero-G movement."
      ],
      technical: [
        "Welcome to Technical Training! 🛠️",
        "We'll master spacecraft systems together.",
        "Safety protocols are our first priority."
      ],
      simulation: [
        "Welcome to Space Simulation! 🚀",
        "Time to put your skills to the test.",
        "Let's begin with basic mission scenarios."
      ]
    };

    for (let message of introMessages[moduleType] || []) {
      await this.showMessage(message, 4000);
    }
  }
}

window.aiCompanion = new AICompanion();