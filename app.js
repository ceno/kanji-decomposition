// Application state
let kanjiData = {};
let originalData = {};
let modifiedData = {};
let currentPage = 1;
const itemsPerPage = 10;
let accessToken = null;
let currentUser = null;

// Configuration - can be modified for different repositories
const REPO_OWNER = 'ceno';
const REPO_NAME = 'kanji-decomposition';

// GitHub OAuth configuration
const GITHUB_CLIENT_ID = 'Ov23liibHbYtMy5FxJVj';
const OAUTH_REDIRECT_URI = window.location.origin + window.location.pathname;
const OAUTH_CALLBACK_API = window.location.origin + '/api/oauth-callback';

// DOM elements
const tableBody = document.getElementById('tableBody');
const pageInfo = document.getElementById('pageInfo');
const itemInfo = document.getElementById('itemInfo');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const editModal = document.getElementById('editModal');
const prModal = document.getElementById('prModal');
const closeModalBtn = document.getElementById('closeModal');
const closePRModalBtn = document.getElementById('closePRModal');
const editComponentSpan = document.getElementById('editComponent');
const partsInput = document.getElementById('partsInput');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');
const submitPRBtn = document.getElementById('submitPRBtn');
const changesCount = document.getElementById('changesCount');
const cancelPRBtn = document.getElementById('cancelPRBtn');
const submitPRActionBtn = document.getElementById('submitPRActionBtn');
const prStatus = document.getElementById('prStatus');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userInfo = document.getElementById('userInfo');
const username = document.getElementById('username');

let currentEditingComponent = null;

// Initialize the application
async function init() {
    try {
        // Check for OAuth callback
        handleOAuthCallback();
        
        // Check if user is already authenticated
        checkAuthStatus();
        
        const response = await fetch('kanji-parts.json');
        kanjiData = await response.json();
        originalData = JSON.parse(JSON.stringify(kanjiData));
        renderTable();
        setupEventListeners();
    } catch (error) {
        console.error('Error loading kanji data:', error);
        showError('Failed to load kanji data. Please refresh the page.');
    }
}

// Setup event listeners
function setupEventListeners() {
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
        }
    });

    nextBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(Object.keys(kanjiData).length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderTable();
        }
    });

    closeModalBtn.addEventListener('click', closeEditModal);
    closePRModalBtn.addEventListener('click', closePRModal);
    cancelBtn.addEventListener('click', closeEditModal);
    saveBtn.addEventListener('click', saveEdit);
    cancelPRBtn.addEventListener('click', closePRModal);
    submitPRBtn.addEventListener('click', openPRModal);
    submitPRActionBtn.addEventListener('click', submitPullRequest);
    loginBtn.addEventListener('click', initiateGitHubLogin);
    logoutBtn.addEventListener('click', logout);

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === editModal) {
            closeEditModal();
        }
        if (e.target === prModal) {
            closePRModal();
        }
    });

    // Handle Enter key in parts input
    partsInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveEdit();
        }
    });
}

// Render the table with pagination
function renderTable() {
    const entries = Object.entries(kanjiData);
    const totalPages = Math.ceil(entries.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageEntries = entries.slice(startIndex, endIndex);

    tableBody.innerHTML = '';

    pageEntries.forEach(([component, parts]) => {
        const row = document.createElement('tr');
        const isModified = modifiedData.hasOwnProperty(component);
        if (isModified) {
            row.classList.add('modified');
        }

        row.innerHTML = `
            <td class="component-cell">${component}</td>
            <td class="parts-cell">${parts.map(part => `<span class="part">${part}</span>`).join('')}</td>
            <td>
                <button class="btn btn-edit" data-component="${component}">Edit</button>
            </td>
        `;

        tableBody.appendChild(row);
    });

    // Update pagination info
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    const showingStart = Math.min(startIndex + 1, entries.length);
    const showingEnd = Math.min(endIndex, entries.length);
    itemInfo.textContent = `Showing ${showingStart}-${showingEnd} of ${entries.length} items`;

    // Update pagination buttons
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;

    // Setup edit buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const component = e.target.getAttribute('data-component');
            openEditModal(component);
        });
    });

    updateChangesCount();
}

// Open edit modal
function openEditModal(component) {
    currentEditingComponent = component;
    editComponentSpan.textContent = component;
    partsInput.value = kanjiData[component].join(', ');
    editModal.classList.add('active');
    partsInput.focus();
}

// Close edit modal
function closeEditModal() {
    editModal.classList.remove('active');
    currentEditingComponent = null;
    partsInput.value = '';
}

// Save edit
function saveEdit() {
    if (!currentEditingComponent) return;

    const partsString = partsInput.value.trim();
    if (!partsString) {
        partsInput.style.borderColor = '#e74c3c';
        partsInput.focus();
        return;
    }

    // Parse the input
    const newParts = partsString.split(',').map(part => part.trim()).filter(part => part);

    if (newParts.length === 0) {
        partsInput.style.borderColor = '#e74c3c';
        partsInput.focus();
        return;
    }

    partsInput.style.borderColor = '';

    // Update the data
    kanjiData[currentEditingComponent] = newParts;

    // Track modifications
    const originalParts = originalData[currentEditingComponent];
    const isModified = JSON.stringify(originalParts) !== JSON.stringify(newParts);

    if (isModified) {
        modifiedData[currentEditingComponent] = newParts;
    } else {
        delete modifiedData[currentEditingComponent];
    }

    closeEditModal();
    renderTable();
}

// Update changes count
function updateChangesCount() {
    const changeCount = Object.keys(modifiedData).length;
    if (changeCount === 0) {
        changesCount.textContent = 'No changes made yet';
        submitPRBtn.disabled = true;
    } else {
        changesCount.textContent = `${changeCount} change${changeCount > 1 ? 's' : ''} made`;
        submitPRBtn.disabled = false;
    }
}

// Open PR modal
function openPRModal() {
    if (!accessToken) {
        showPRStatus('Please login with GitHub first to submit a pull request.', 'error');
        return;
    }
    prStatus.textContent = '';
    prStatus.className = 'status-message';
    prModal.classList.add('active');
}

// Close PR modal
function closePRModal() {
    prModal.classList.remove('active');
}

// Submit pull request
async function submitPullRequest() {
    const title = document.getElementById('prTitle').value.trim();
    const description = document.getElementById('prDescription').value.trim();

    if (!title || !description) {
        showPRStatus('Please fill in all fields', 'error');
        return;
    }

    if (!accessToken) {
        showPRStatus('Please login with GitHub first', 'error');
        return;
    }

    showPRStatus('Creating pull request...', 'info');
    submitPRActionBtn.disabled = true;

    try {
        // Prepare the updated JSON
        const updatedData = { ...originalData, ...modifiedData };
        const sortedData = Object.keys(updatedData).sort().reduce((acc, key) => {
            acc[key] = updatedData[key];
            return acc;
        }, {});
        const jsonContent = JSON.stringify(sortedData, null, 2) + '\n';

        // GitHub API configuration
        const baseURL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;
        const headers = {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        };

        // Get the default branch
        const repoResponse = await fetch(baseURL, { headers });
        if (!repoResponse.ok) {
            throw new Error('Failed to fetch repository information. Check your token.');
        }
        const repoData = await repoResponse.json();
        const defaultBranch = repoData.default_branch;

        // Get the SHA of the default branch
        const refResponse = await fetch(`${baseURL}/git/ref/heads/${defaultBranch}`, { headers });
        if (!refResponse.ok) {
            throw new Error('Failed to fetch branch information');
        }
        const refData = await refResponse.json();
        const baseSha = refData.object.sha;

        // Create a new branch
        const timestamp = Date.now();
        const branchName = `update-kanji-parts-${timestamp}`;
        const createBranchResponse = await fetch(`${baseURL}/git/refs`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                ref: `refs/heads/${branchName}`,
                sha: baseSha
            })
        });

        if (!createBranchResponse.ok) {
            throw new Error('Failed to create branch');
        }

        // Get the current file SHA from the default branch
        const fileResponse = await fetch(`${baseURL}/contents/kanji-parts.json?ref=${defaultBranch}`, { headers });
        let fileSha = null;
        if (fileResponse.ok) {
            const fileData = await fileResponse.json();
            fileSha = fileData.sha;
        }

        // Update the file
        const updateFileResponse = await fetch(`${baseURL}/contents/kanji-parts.json`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
                message: `Update kanji-parts.json: ${title}`,
                content: btoa(encodeURIComponent(jsonContent).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16)))),
                sha: fileSha,
                branch: branchName
            })
        });

        if (!updateFileResponse.ok) {
            throw new Error('Failed to update file');
        }

        // Create pull request
        const prResponse = await fetch(`${baseURL}/pulls`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                title: title,
                body: description + '\n\n---\nCreated via Kanji Decomposition Manager',
                head: branchName,
                base: defaultBranch
            })
        });

        if (!prResponse.ok) {
            const errorData = await prResponse.json();
            throw new Error(errorData.message || 'Failed to create pull request');
        }

        const prData = await prResponse.json();
        const successMessage = document.createElement('span');
        successMessage.textContent = 'Pull request created successfully! ';
        const prLink = document.createElement('a');
        prLink.href = prData.html_url;
        prLink.target = '_blank';
        prLink.textContent = `View PR #${prData.number}`;
        successMessage.appendChild(prLink);
        showPRStatus(successMessage, 'success');

        // Clear modifications after successful PR
        setTimeout(() => {
            modifiedData = {};
            kanjiData = JSON.parse(JSON.stringify(originalData));
            renderTable();
            closePRModal();
        }, 3000);

    } catch (error) {
        console.error('Error creating pull request:', error);
        showPRStatus(`Error: ${error.message}`, 'error');
    } finally {
        submitPRActionBtn.disabled = false;
    }
}

// Show PR status message
function showPRStatus(message, type) {
    prStatus.textContent = '';
    if (typeof message === 'string') {
        prStatus.textContent = message;
    } else {
        prStatus.appendChild(message);
    }
    prStatus.className = `status-message ${type}`;
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'status-message error';
    errorDiv.textContent = message;
    document.querySelector('.container').insertBefore(errorDiv, document.querySelector('main'));
}

// GitHub OAuth functions
function initiateGitHubLogin() {
    // Generate a random state for CSRF protection
    const state = generateRandomState();
    sessionStorage.setItem('oauth_state', state);
    
    // Redirect to GitHub OAuth authorization
    const authUrl = `https://github.com/login/oauth/authorize?` +
        `client_id=${GITHUB_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(OAUTH_REDIRECT_URI)}&` +
        `scope=public_repo&` +
        `state=${state}`;
    
    window.location.href = authUrl;
}

function generateRandomState() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function handleOAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const storedState = sessionStorage.getItem('oauth_state');
    
    if (code && state && state === storedState) {
        // Show success message and guide user
        showOAuthSuccessModal(code);
        
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        sessionStorage.removeItem('oauth_state');
    }
}

async function showOAuthSuccessModal(code) {
    // Exchange code for token using our serverless function
    try {
        const response = await fetch(`${OAUTH_CALLBACK_API}?code=${code}`);
        const data = await response.json();
        
        if (data.token) {
            accessToken = data.token;
            sessionStorage.setItem('github_token', accessToken);
            await fetchUserInfo();
            updateAuthUI();
        } else {
            throw new Error(data.error || 'Failed to get access token');
        }
    } catch (error) {
        console.error('Error exchanging code:', error);
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'oauthErrorModal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Authentication Error</h2>
                </div>
                <div class="modal-body">
                    <div class="status-message error">
                        <strong>Failed to complete authentication:</strong> ${error.message}
                        <p style="margin-top: 10px;">Make sure the OAuth callback API is properly deployed and configured with your GitHub OAuth App credentials.</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" id="closeOAuthErrorModal">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        document.getElementById('closeOAuthErrorModal').addEventListener('click', () => {
            modal.remove();
        });
    }
}

async function fetchUserInfo() {
    try {
        const response = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (response.ok) {
            currentUser = await response.json();
        }
    } catch (error) {
        console.error('Error fetching user info:', error);
    }
}

function checkAuthStatus() {
    const storedToken = sessionStorage.getItem('github_token');
    if (storedToken) {
        accessToken = storedToken;
        fetchUserInfo().then(() => updateAuthUI());
    }
}

function updateAuthUI() {
    if (accessToken && currentUser) {
        loginBtn.style.display = 'none';
        userInfo.style.display = 'flex';
        username.textContent = currentUser.login;
    } else {
        loginBtn.style.display = 'inline-block';
        userInfo.style.display = 'none';
    }
}

function logout() {
    accessToken = null;
    currentUser = null;
    sessionStorage.removeItem('github_token');
    sessionStorage.removeItem('oauth_state');
    updateAuthUI();
}

// Initialize the app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
