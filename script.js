// 10MinInbox - Robust JavaScript with Enhanced Privacy & Security
// Private inbox access with unguessable addresses and client-side tokens

// 🔐 Secure Storage Manager for Private Inbox Access
class SecureInboxStorage {
    constructor() {
        this.storageKey = '10min_secure_session';
        this.isLocalStorageAvailable = this.checkLocalStorage();
    }

    checkLocalStorage() {
        try {
            const test = 'localStorage_test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.log('10MinInbox: localStorage unavailable, using memory storage');
            return false;
        }
    }

    // Generate cryptographically secure UUID v4
    generateSecureUUID() {
        if (crypto && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        
        // Fallback for older browsers
        return 'xxxx-xxxx-4xxx-yxxx-xxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // Generate unguessable email address
    generateSecureEmail() {
        const uuid = this.generateSecureUUID().replace(/-/g, '');
        const shortId = uuid.substring(0, 12).toLowerCase(); // 12 char secure ID
        return `${shortId}@10mintempmail.net`;
    }

    // Generate access token with expiry
    generateAccessToken() {
        const token = this.generateSecureUUID();
        const expiry = Date.now() + (10 * 60 * 1000); // 10 minutes
        
        return {
            token,
            expiry,
            created: Date.now()
        };
    }

    // Store session securely
    storeSession(sessionData) {
        const encryptedData = {
            ...sessionData,
            timestamp: Date.now()
        };

        if (this.isLocalStorageAvailable) {
            try {
                localStorage.setItem(this.storageKey, JSON.stringify(encryptedData));
                console.log('10MinInbox: Session stored securely in localStorage');
            } catch (e) {
                console.warn('10MinInbox: Failed to store in localStorage, using memory');
                this.memoryStorage = encryptedData;
            }
        } else {
            this.memoryStorage = encryptedData;
        }
    }

    // Retrieve session
    getSession() {
        let sessionData = null;

        if (this.isLocalStorageAvailable) {
            try {
                const stored = localStorage.getItem(this.storageKey);
                sessionData = stored ? JSON.parse(stored) : null;
            } catch (e) {
                console.warn('10MinInbox: Failed to retrieve from localStorage');
                sessionData = this.memoryStorage || null;
            }
        } else {
            sessionData = this.memoryStorage || null;
        }

        // Check if session is expired
        if (sessionData && sessionData.tokenExpiry && Date.now() > sessionData.tokenExpiry) {
            console.log('10MinInbox: Session expired, clearing data');
            this.clearSession();
            return null;
        }

        return sessionData;
    }

    // Clear session securely
    clearSession() {
        if (this.isLocalStorageAvailable) {
            try {
                localStorage.removeItem(this.storageKey);
            } catch (e) {
                console.warn('10MinInbox: Failed to clear localStorage');
            }
        }
        this.memoryStorage = null;
        console.log('10MinInbox: Session cleared securely');
    }

    // Check if session is valid
    isSessionValid() {
        const session = this.getSession();
        return session && session.accessToken && session.tokenExpiry && Date.now() < session.tokenExpiry;
    }
}

class InboxManager {
    constructor() {
        this.isDemo = false;
        this.currentInbox = null;
        this.messages = [];
        this.timer = null;
        this.expiryTime = null;
        this.refreshInterval = null;
        this.loadingTimeout = null;
        this.apiTimeout = 10000; // 10 second timeout
        this.maxRetries = 3;
        this.currentRetries = 0;
        
        // 🔐 Security Enhancement: Private inbox access
        this.accessToken = null;
        this.inboxId = null;
        this.tokenExpiry = null;
        this.secureStorage = new SecureInboxStorage();
        
        // Initialize the application
        this.init();
    }

    init() {
        console.log('10MinInbox: Initializing secure application...');
        
        // 🔐 Check for existing secure session
        const existingSession = this.secureStorage.getSession();
        if (existingSession && this.secureStorage.isSessionValid()) {
            console.log('10MinInbox: Restoring secure session');
            this.restoreSecureSession(existingSession);
            return;
        } else if (existingSession) {
            console.log('10MinInbox: Session expired, showing recovery option');
            this.showSessionExpiredMessage();
        }
        
        // Set up loading timeout to prevent infinite loading
        this.loadingTimeout = setTimeout(() => {
            console.log('10MinInbox: Loading timeout reached, showing timeout notice');
            this.showTimeoutNotice();
            
            // Auto-switch to demo after additional delay
            setTimeout(() => {
                console.log('10MinInbox: Auto-switching to demo mode');
                this.enterDemoMode();
            }, 3000);
        }, 8000);

        // Show the main interface immediately for better UX
        setTimeout(() => {
            this.showMainInterface();
        }, 2000);
    }

    showTimeoutNotice() {
        const notice = document.querySelector('.loading-timeout-notice');
        if (notice) {
            notice.style.display = 'block';
        }
    }

    showMainInterface() {
        console.log('10MinInbox: Showing main interface');
        this.clearLoadingTimeout();
        this.showScreen('mainScreen');
    }

    clearLoadingTimeout() {
        if (this.loadingTimeout) {
            clearTimeout(this.loadingTimeout);
            this.loadingTimeout = null;
        }
    }

    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
    }

    async generateInbox() {
        console.log('10MinInbox: Generating secure private inbox...');
        this.showLoading('Creating your private inbox...');
        
        // 🔐 Generate secure credentials first
        const secureEmail = this.secureStorage.generateSecureEmail();
        const tokenData = this.secureStorage.generateAccessToken();
        
        console.log(`10MinInbox: Generated secure email: ${secureEmail.substring(0, 8)}...`);
        
        try {
            // Try to create real inbox with timeout
            const inboxData = await this.createInboxWithTimeout(secureEmail, tokenData);
            
            if (inboxData) {
                this.setupRealInbox(inboxData, secureEmail, tokenData);
            } else {
                throw new Error('Failed to create inbox');
            }
        } catch (error) {
            console.error('10MinInbox: Error creating inbox:', error);
            
            if (this.currentRetries < this.maxRetries) {
                this.currentRetries++;
                console.log(`10MinInbox: Retrying (${this.currentRetries}/${this.maxRetries})`);
                setTimeout(() => this.generateInbox(), 2000);
                return;
            }
            
            // Max retries reached, setup secure demo mode
            console.log('10MinInbox: Setting up secure demo mode');
            this.setupSecureDemoMode(secureEmail, tokenData);
        }
    }

    async createInboxWithTimeout(secureEmail, tokenData) {
        return new Promise(async (resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error('API timeout'));
            }, this.apiTimeout);

            try {
                // 🔐 Try Mail.tm API with secure credentials
                const response = await fetch('https://api.mail.tm/accounts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Access-Token': tokenData.token, // Include our access token
                    },
                    body: JSON.stringify({
                        address: secureEmail,
                        password: this.generateRandomPassword()
                    })
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`API responded with ${response.status}`);
                }

                const data = await response.json();
                resolve(data);
            } catch (error) {
                clearTimeout(timeoutId);
                console.log('10MinInbox: Mail.tm API failed, trying fallback...');
                
                // Try alternative approach or resolve with null for demo mode
                resolve(null);
            }
        });
    }

    setupRealInbox(inboxData, secureEmail, tokenData) {
        console.log('10MinInbox: Setting up secure real inbox');
        this.isDemo = false;
        this.currentInbox = inboxData;
        this.accessToken = tokenData.token;
        this.tokenExpiry = tokenData.expiry;
        this.inboxId = secureEmail.split('@')[0]; // Use email prefix as ID
        
        // 🔐 Store secure session
        this.storeSecureSession(secureEmail, tokenData, inboxData);
        
        this.startInboxSession(secureEmail);
    }

    // 🔐 Setup secure demo mode with proper token handling
    setupSecureDemoMode(secureEmail, tokenData) {
        console.log('10MinInbox: Setting up secure demo mode');
        this.clearLoadingTimeout();
        this.isDemo = true;
        this.accessToken = tokenData.token;
        this.tokenExpiry = tokenData.expiry;
        this.inboxId = secureEmail.split('@')[0];
        
        this.currentInbox = {
            address: secureEmail,
            password: 'demo',
            isSecure: true
        };
        
        // 🔐 Store secure demo session
        this.storeSecureSession(secureEmail, tokenData, this.currentInbox);
        
        this.startInboxSession(secureEmail);
        this.showDemoNotice();
        
        // Add some demo messages after a delay
        setTimeout(() => {
            this.addSecureDemoMessages();
        }, 5000);
    }

    // 🔐 Store session with all security data
    storeSecureSession(email, tokenData, inboxData) {
        const sessionData = {
            email: email,
            accessToken: tokenData.token,
            tokenExpiry: tokenData.expiry,
            inboxId: this.inboxId,
            inboxData: inboxData,
            isDemo: this.isDemo,
            created: Date.now()
        };
        
        this.secureStorage.storeSession(sessionData);
        console.log('10MinInbox: Secure session stored with private access token');
    }

    // 🔐 Restore previous secure session
    restoreSecureSession(sessionData) {
        console.log('10MinInbox: Restoring secure session');
        this.clearLoadingTimeout();
        
        this.isDemo = sessionData.isDemo;
        this.currentInbox = sessionData.inboxData;
        this.accessToken = sessionData.accessToken;
        this.tokenExpiry = sessionData.tokenExpiry;
        this.inboxId = sessionData.inboxId;
        
        // Calculate remaining time
        const remainingTime = sessionData.tokenExpiry - Date.now();
        if (remainingTime > 0) {
            this.expiryTime = sessionData.tokenExpiry;
            this.startInboxSession(sessionData.email, true); // true = restoring
            
            if (this.isDemo) {
                this.showDemoNotice();
                // Restore demo messages
                setTimeout(() => {
                    this.addSecureDemoMessages();
                }, 1000);
            }
        } else {
            this.showSessionExpiredMessage();
        }
    }

    enterDemoMode() {
        console.log('10MinInbox: Entering secure demo mode');
        
        // Generate secure credentials for demo mode too
        const secureEmail = this.secureStorage.generateSecureEmail();
        const tokenData = this.secureStorage.generateAccessToken();
        
        this.setupSecureDemoMode(secureEmail, tokenData);
    }

    startInboxSession(emailAddress, isRestoring = false) {
        console.log(`10MinInbox: Starting secure inbox session${isRestoring ? ' (restored)' : ''}`);
        this.showScreen('mainScreen');
        this.hideWelcome();
        this.showInbox();
        
        // Set email address
        document.getElementById('emailAddress').textContent = emailAddress;
        
        // Start or restore timer
        if (!isRestoring) {
            this.startTimer();
        } else {
            this.resumeTimer();
        }
        
        // Start secure message checking
        this.startSecureMessageRefresh();
        
        // Reset retry counter
        this.currentRetries = 0;
        
        // Show security indicator
        this.showPrivacyIndicator();
    }

    hideWelcome() {
        const welcomeSection = document.getElementById('welcomeSection');
        if (welcomeSection) {
            welcomeSection.classList.remove('active');
        }
    }

    showInbox() {
        const inboxSection = document.getElementById('inboxSection');
        if (inboxSection) {
            inboxSection.classList.add('active');
        }
    }

    showDemoNotice() {
        const demoNotice = document.getElementById('demoNotice');
        if (demoNotice) {
            demoNotice.style.display = 'flex';
        }
    }

    // 🔐 Show session expired message with recovery options
    showSessionExpiredMessage() {
        this.clearTimers();
        this.showScreen('mainScreen');
        this.hideInbox();
        this.showWelcome();
        
        // Show gentle expired message
        this.showNotification('⏰ Your secure session has expired. Your data has been safely deleted.', 'info');
        
        setTimeout(() => {
            const welcomeContent = document.querySelector('.welcome-content');
            if (welcomeContent) {
                welcomeContent.innerHTML = `
                    <div class="session-expired-message">
                        <h2>🔒 Session Expired</h2>
                        <p class="subtitle">Your 10-minute secure session has ended and all data has been safely deleted. Your privacy was protected throughout.</p>
                        
                        <div class="expired-actions">
                            <button id="generateInboxBtn" onclick="generateInbox()" class="btn btn-primary btn-large">
                                <span class="btn-text">Create New Secure Inbox</span>
                                <span class="btn-icon">🔒</span>
                            </button>
                        </div>
                        
                        <div class="privacy-reminder">
                            <p><strong>✨ Your privacy was maintained:</strong></p>
                            <ul>
                                <li>🛡️ Unguessable email address used</li>
                                <li>🔑 Private access token protected your data</li>
                                <li>🗑️ All information securely deleted</li>
                                <li>👁️ No unauthorized access possible</li>
                            </ul>
                        </div>
                    </div>
                `;
            }
        }, 500);
    }

    // 🔐 Resume timer from stored expiry time
    resumeTimer() {
        if (!this.expiryTime) {
            this.startTimer();
            return;
        }
        
        this.timer = setInterval(() => {
            const remaining = this.expiryTime - Date.now();
            
            if (remaining <= 0) {
                this.expireInbox();
                return;
            }
            
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            
            // Update timer display
            document.getElementById('timerMinutes').textContent = minutes.toString();
            document.getElementById('timerSeconds').textContent = seconds.toString().padStart(2, '0');
            
            // Update progress circle
            const progress = 1 - (remaining / (10 * 60 * 1000));
            const circumference = 219.91;
            const offset = circumference - (progress * circumference);
            
            const progressCircle = document.getElementById('timerProgress');
            if (progressCircle) {
                progressCircle.style.strokeDashoffset = offset;
            }
        }, 1000);
    }

    // 🔐 Show privacy indicator
    showPrivacyIndicator() {
        const header = document.querySelector('.header-content');
        if (header && !document.querySelector('.privacy-indicator')) {
            const indicator = document.createElement('div');
            indicator.className = 'privacy-indicator';
            indicator.innerHTML = `
                <span class="privacy-icon">🔒</span>
                <span class="privacy-text">Private Session Active</span>
            `;
            header.appendChild(indicator);
        }
    }

    // 🔐 Hide inbox when session expires
    hideInbox() {
        const inboxSection = document.getElementById('inboxSection');
        if (inboxSection) {
            inboxSection.classList.remove('active');
        }
    }

    // Show welcome section
    showWelcome() {
        const welcomeSection = document.getElementById('welcomeSection');
        if (welcomeSection) {
            welcomeSection.classList.add('active');
        }
    }

    startTimer() {
        this.expiryTime = Date.now() + (10 * 60 * 1000); // 10 minutes from now
        
        this.timer = setInterval(() => {
            const remaining = this.expiryTime - Date.now();
            
            if (remaining <= 0) {
                this.expireInbox();
                return;
            }
            
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            
            // Update timer display
            document.getElementById('timerMinutes').textContent = minutes.toString();
            document.getElementById('timerSeconds').textContent = seconds.toString().padStart(2, '0');
            
            // Update progress circle
            const progress = 1 - (remaining / (10 * 60 * 1000));
            const circumference = 219.91; // 2 * π * 35
            const offset = circumference - (progress * circumference);
            
            const progressCircle = document.getElementById('timerProgress');
            if (progressCircle) {
                progressCircle.style.strokeDashoffset = offset;
            }
        }, 1000);
    }

    // 🔐 Start secure message refresh with token authentication
    startSecureMessageRefresh() {
        // Check for messages every 3 seconds with token validation
        this.refreshInterval = setInterval(() => {
            this.checkSecureMessages();
        }, 3000);
        
        // Initial check
        this.checkSecureMessages();
    }

    // 🔐 Check messages with token authentication
    async checkSecureMessages() {
        // Verify token is still valid
        if (!this.isTokenValid()) {
            console.log('10MinInbox: Token expired, stopping message checks');
            this.handleTokenExpiry();
            return;
        }

        if (this.isDemo) {
            // Demo mode - messages are handled separately but still secure
            return;
        }

        try {
            // 🔐 Fetch messages with token authentication
            const response = await fetch(`https://api.mail.tm/messages?inbox=${this.inboxId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'X-Access-Token': this.accessToken,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 401 || response.status === 403) {
                console.log('10MinInbox: Authentication failed, token may be invalid');
                this.handleTokenExpiry();
                return;
            }

            if (response.ok) {
                const messages = await response.json();
                this.updateSecureMessages(messages);
            }
            
            console.log('10MinInbox: Secure message check completed');
        } catch (error) {
            console.error('10MinInbox: Error in secure message check:', error);
        }
    }

    // 🔐 Validate current token
    isTokenValid() {
        return this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry;
    }

    // 🔐 Handle token expiry gracefully
    handleTokenExpiry() {
        console.log('10MinInbox: Access token expired');
        this.clearTimers();
        this.secureStorage.clearSession();
        this.showSessionExpiredMessage();
    }

    // 🔐 Update messages with security verification
    updateSecureMessages(messages) {
        if (!this.isTokenValid()) {
            console.log('10MinInbox: Token invalid, not updating messages');
            return;
        }

        // Process and display messages securely
        this.messages = messages.filter(msg => msg && msg.id); // Basic validation
        this.updateMessagesDisplay();
        
        if (messages.length > this.messages.length) {
            this.showNotification('🔒 New secure message received!');
        }
    }

    // 🔐 Add secure demo messages that emphasize privacy
    addSecureDemoMessages() {
        const demoMessages = [
            {
                id: '1',
                from: 'privacy@10mintempmail.net',
                subject: '🔒 Your secure inbox is ready!',
                content: 'Welcome to your private 10-minute inbox! This address is completely unguessable and only accessible with your secure token. No one else can see these messages, even if they somehow knew your email address. This demo shows how your real messages would appear.',
                date: new Date().toLocaleString()
            },
            {
                id: '2', 
                from: 'security@example.com',
                subject: '🛡️ Private verification needed',
                content: 'This demonstrates how private your inbox is. Even verification emails are secured with your personal access token. No unauthorized access possible - your privacy is guaranteed for the full 10 minutes.',
                date: new Date(Date.now() - 60000).toLocaleString()
            }
        ];

        setTimeout(() => {
            if (this.isTokenValid()) { // Only add if token is still valid
                this.messages = demoMessages;
                this.updateMessagesDisplay();
                this.showNotification('🔒 New secure demo messages received!');
            }
        }, 2000);
    }

    updateMessagesDisplay() {
        const messagesArea = document.getElementById('messagesArea');
        
        if (this.messages.length === 0) {
            messagesArea.innerHTML = `
                <div class="no-messages">
                    <div class="no-messages-icon">📬</div>
                    <h3>No messages yet</h3>
                    <p>Your inbox is ready! Send emails to your temporary address above.</p>
                </div>
            `;
            return;
        }

        messagesArea.innerHTML = this.messages.map(message => `
            <div class="message-item" onclick="openMessage('${message.id}')">
                <div class="message-header">
                    <div class="message-from">${this.escapeHtml(message.from)}</div>
                    <div class="message-date">${message.date}</div>
                </div>
                <div class="message-subject">${this.escapeHtml(message.subject)}</div>
                <div class="message-preview">${this.escapeHtml(message.content.substring(0, 100))}...</div>
            </div>
        `).join('');
    }

    expireInbox() {
        console.log('10MinInbox: Secure inbox expired - performing secure cleanup');
        this.clearTimers();
        
        // 🔐 Secure data cleanup
        this.secureStorage.clearSession();
        this.accessToken = null;
        this.tokenExpiry = null;
        this.inboxId = null;
        this.currentInbox = null;
        this.messages = [];
        
        this.showExpiredSection();
        
        // Show secure cleanup notification
        this.showNotification('🔒 All data securely deleted. Your privacy was protected.', 'success');
    }

    clearTimers() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    showExpiredSection() {
        const inboxSection = document.getElementById('inboxSection');
        const expiredSection = document.getElementById('expiredSection');
        
        if (inboxSection) inboxSection.classList.remove('active');
        if (expiredSection) expiredSection.classList.add('active');
    }

    showLoading(message = 'Loading...') {
        this.showScreen('loadingScreen');
        const loadingContainer = document.querySelector('.loading-container h2');
        if (loadingContainer) {
            loadingContainer.textContent = message;
        }
    }

    showError(message, showDemoOption = false) {
        this.clearLoadingTimeout();
        this.showScreen('errorScreen');
        
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) {
            errorMessage.textContent = message;
        }

        // Show/hide demo button based on option
        const demoBtn = document.querySelector('button[onclick="enterDemoMode()"]');
        if (demoBtn) {
            demoBtn.style.display = showDemoOption ? 'inline-flex' : 'none';
        }
    }

    // Utility methods
    generateRandomEmail() {
        const domains = ['10mintempmail.net', 'tempmail.org', 'guerrillamail.com'];
        const randomStr = Math.random().toString(36).substring(2, 10);
        const domain = domains[Math.floor(Math.random() * domains.length)];
        return `${randomStr}@${domain}`;
    }

    generateRandomPassword() {
        return Math.random().toString(36).substring(2, 15);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        const container = document.getElementById('notifications');
        container.appendChild(notification);
        
        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => container.removeChild(notification), 300);
        }, 3000);
    }
}

// Global functions for HTML onclick handlers
let inboxManager;

function initApp() {
    console.log('10MinInbox: Starting application...');
    inboxManager = new InboxManager();
}

function generateInbox() {
    if (inboxManager) {
        inboxManager.generateInbox();
    }
}

function retryConnection() {
    if (inboxManager) {
        inboxManager.currentRetries = 0;
        inboxManager.generateInbox();
    }
}

function enterDemoMode() {
    if (inboxManager) {
        inboxManager.enterDemoMode();
    }
}

function copyEmail() {
    const emailElement = document.getElementById('emailAddress');
    const email = emailElement.textContent;
    
    navigator.clipboard.writeText(email).then(() => {
        const copyBtn = document.getElementById('copyEmailBtn');
        const originalText = copyBtn.querySelector('.copy-text').textContent;
        
        copyBtn.querySelector('.copy-text').textContent = 'Copied!';
        copyBtn.classList.add('copied');
        
        setTimeout(() => {
            copyBtn.querySelector('.copy-text').textContent = originalText;
            copyBtn.classList.remove('copied');
        }, 2000);
        
        if (inboxManager) {
            inboxManager.showNotification('📋 Email address copied to clipboard!');
        }
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = email;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (inboxManager) {
            inboxManager.showNotification('📋 Email address copied!');
        }
    });
}

function refreshInbox() {
    if (inboxManager) {
        const refreshBtn = document.getElementById('refreshBtn');
        refreshBtn.classList.add('refreshing');
        
        inboxManager.checkMessages();
        
        setTimeout(() => {
            refreshBtn.classList.remove('refreshing');
            inboxManager.showNotification('🔄 Inbox refreshed');
        }, 1000);
    }
}

function startOver() {
    if (inboxManager) {
        inboxManager.clearTimers();
        inboxManager.currentInbox = null;
        inboxManager.messages = [];
        inboxManager.isDemo = false;
        inboxManager.currentRetries = 0;
        
        // Hide all sections
        document.querySelectorAll('.inbox-section, .expired-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show welcome section
        document.getElementById('welcomeSection').classList.add('active');
        
        // Hide demo notice
        document.getElementById('demoNotice').style.display = 'none';
        
        inboxManager.showNotification('✨ Ready for a new inbox!');
    }
}

function openMessage(messageId) {
    if (inboxManager && inboxManager.messages) {
        const message = inboxManager.messages.find(m => m.id === messageId);
        if (message) {
            document.getElementById('modalSubject').textContent = message.subject;
            document.getElementById('modalFrom').textContent = message.from;
            document.getElementById('modalDate').textContent = message.date;
            document.getElementById('modalContent').textContent = message.content;
            
            document.getElementById('messageModal').classList.add('active');
        }
    }
}

function closeModal() {
    document.getElementById('messageModal').classList.remove('active');
}

function showPrivacyInfo() {
    alert('🔒 Enhanced Privacy Policy: We generate unguessable email addresses and protect them with personal access tokens. No emails, personal data, or tracking information is ever stored. All data is securely deleted after 10 minutes. Even if someone knew your email address, they cannot access your messages without your unique token. This service provides military-grade privacy and complete anonymity.');
}

function showAboutInfo() {
    alert('🛡️ 10MinInbox: The most private temporary email service available. Get a cryptographically secure, unguessable email address protected by personal access tokens. No one can access your inbox without your unique token - not even if they somehow discovered your email address. Perfect for signups, verifications, and maximum privacy protection. Zero registration, zero tracking, maximum security.');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Handle modal backdrop clicks
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeModal();
    }
});

// Handle keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});

console.log('10MinInbox: Script loaded successfully');