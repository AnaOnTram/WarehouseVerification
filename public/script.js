// Global variables
let currentUser = null;
let currentItem = null;
let currentForwarder = null;
let currentTransferItemId = null;
let currentLanguage = 'en'; // Default to English

// Language translations
const translations = {
    en: {
        // Login Screen
        login: 'Login',
        username: 'Username',
        password: 'Password',
        loginButton: 'Login',
        
        // Dashboard
        dashboard: 'Dashboard',
        uploadMBV: 'Upload MBV',
        myItems: 'My Items',
        transfers: 'Transfers',
        adminPanel: 'Admin Panel',
        logout: 'Logout',
        
        // Common buttons
        back: 'Back',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        search: 'Search',
        clear: 'Clear',
        export: 'Export',
        confirm: 'Confirm',
        
        // Item management
        itemInformation: 'Item Information',
        storageLocation: 'Storage Location',
        partNumber: 'Part Number',
        serialNumber: 'Serial Number',
        itemType: 'Item Type',
        forwarder: 'Forwarder',
        status: 'Status',
        operator: 'Operator',
        createdAt: 'Created At',
        
        // Status labels
        pending: 'Pending',
        processing: 'Processing',
        processed: 'Processed',
        availableForPickup: 'Available for Pickup',
        shipped: 'Shipped',
        
        // Transfer process
        pickerInformation: 'Picker Information',
        pickerName: 'Picker Name',
        pickerID: 'Picker ID',
        carPlateNumber: 'Car Plate Number (Optional)',
        tagVerification: 'Tag Verification',
        
        // Process steps
        processChecklist: 'Process Checklist',
        itemPicked: 'Item Picked from Storage',
        identityVerified: 'Item Identity and Integration Check',
        sapOperationDone: 'SAP Operation Completed',
        packaged: 'Item Packaged',
        photographed: 'Item Photographed (if required)',
        forwarderBooked: 'Forwarder/Courier Booked',
        placedInDesignatedArea: 'Item Placed in Designated Area',
        
        // Status updates
        statusUpdate: 'Status Update',
        confirmBookingMessage: 'Confirm booking has been made to forwarder/courier and the item is ready for pickup.',
        confirmAndProceed: 'Confirm and Proceed',
        
        // Verification
        tagVerificationResults: 'Tag Verification Results',
        rejectAndRetake: 'Reject & Retake Photo',
        confirmTransfer: 'Confirm Transfer',
        overrideAndComplete: 'Override & Complete Transfer',
        
        // Admin features
        itemsManagement: 'Items Management',
        searchItems: 'Search Items',
        showAllItems: 'Show all items (not just last 72 hours)',
        fromDate: 'From Date',
        toDate: 'To Date',
        applyFilter: 'Apply Filter',
        exportData: 'Export Data',
        exportFrom: 'Export From',
        exportTo: 'Export To',
        exportToCSV: 'Export to CSV',
        
        // Messages
        success: 'Success',
        error: 'Error',
        warning: 'Warning',
        info: 'Info',
        loading: 'Loading...',
        
        // Language switcher
        language: 'Language',
        english: 'English',
        traditionalChinese: 'Traditional Chinese'
    },
    
    'zh-TW': {
        // Login Screen
        login: '登入',
        username: '使用者名稱',
        password: '密碼',
        loginButton: '登入',
        
        // Dashboard
        dashboard: '儀表板',
        uploadMBV: '上傳 MBV',
        myItems: '我的項目',
        transfers: '轉移',
        adminPanel: '管理面板',
        logout: '登出',
        
        // Common buttons
        back: '返回',
        save: '儲存',
        cancel: '取消',
        delete: '刪除',
        edit: '編輯',
        search: '搜尋',
        clear: '清除',
        export: '匯出',
        confirm: '確認',
        
        // Item management
        itemInformation: '項目資訊',
        storageLocation: '儲存位置',
        partNumber: '零件號碼',
        serialNumber: '序列號碼',
        itemType: '項目類型',
        forwarder: '承運商',
        status: '狀態',
        operator: '操作員',
        createdAt: '建立時間',
        
        // Status labels
        pending: '待處理',
        processing: '處理中',
        processed: '已處理',
        availableForPickup: '可供取件',
        shipped: '已出貨',
        
        // Transfer process
        pickerInformation: '取件人資訊',
        pickerName: '取件人姓名',
        pickerID: '取件人身份證',
        carPlateNumber: '車牌號碼（選填）',
        tagVerification: '標籤驗證',
        
        // Process steps
        processChecklist: '處理清單',
        itemPicked: '已從儲存位置取出項目',
        identityVerified: '項目身份與整合檢查',
        sapOperationDone: 'SAP 操作完成',
        packaged: '項目已包裝',
        photographed: '項目已拍照（如需要）',
        forwarderBooked: '承運商/快遞已預訂',
        placedInDesignatedArea: '項目已放置在指定區域',
        
        // Status updates
        statusUpdate: '狀態更新',
        confirmBookingMessage: '確認已向承運商/快遞公司預訂，項目已準備好取件。',
        confirmAndProceed: '確認並繼續',
        
        // Verification
        tagVerificationResults: '標籤驗證結果',
        rejectAndRetake: '拒絕並重新拍照',
        confirmTransfer: '確認轉移',
        overrideAndComplete: '覆蓋並完成轉移',
        
        // Admin features
        itemsManagement: '項目管理',
        searchItems: '搜尋項目',
        showAllItems: '顯示所有項目（不只最近72小時）',
        fromDate: '開始日期',
        toDate: '結束日期',
        applyFilter: '套用篩選',
        exportData: '匯出資料',
        exportFrom: '匯出起始',
        exportTo: '匯出結束',
        exportToCSV: '匯出至 CSV',
        
        // Messages
        success: '成功',
        error: '錯誤',
        warning: '警告',
        info: '資訊',
        loading: '載入中...',
        
        // Language switcher
        language: '語言',
        english: 'English',
        traditionalChinese: '繁體中文'
    }
};

// Translation function
function t(key) {
    return translations[currentLanguage][key] || translations['en'][key] || key;
}

// Language detection and initialization
function initializeLanguage() {
    // Check localStorage first
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && translations[savedLanguage]) {
        currentLanguage = savedLanguage;
        return;
    }
    
    // Detect browser language
    const browserLanguage = navigator.language || navigator.languages[0];
    
    // Map browser languages to our supported languages
    if (browserLanguage.startsWith('zh-TW') || browserLanguage.startsWith('zh-Hant')) {
        currentLanguage = 'zh-TW';
    } else {
        currentLanguage = 'en';
    }
    
    localStorage.setItem('language', currentLanguage);
}

// Change language function
function changeLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    updatePageLanguage();
    showToast(t('success'), t('language') + ' ' + (lang === 'en' ? t('english') : t('traditionalChinese')));
}

// Update page language
function updatePageLanguage() {
    // Update data-translate elements
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (element.tagName === 'INPUT' && (element.type === 'text' || element.type === 'password')) {
            element.placeholder = t(key);
        } else {
            element.textContent = t(key);
        }
    });
    
    // Update specific elements by ID
    const elementsToUpdate = {
        'login-title': t('login'),
        'dashboard-title': t('dashboard')
    };
    
    Object.entries(elementsToUpdate).forEach(([id, text]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = text;
    });
    
    // Refresh current screen content if it's dynamically generated
    const activeScreen = document.querySelector('.screen.active');
    if (activeScreen) {
        const screenId = activeScreen.id;
        if (screenId === 'admin-screen' && currentUser && currentUser.user.role === 'admin') {
            // Re-load admin content with new language
            const activeTab = document.querySelector('.tab-btn.active');
            if (activeTab) {
                const tab = activeTab.getAttribute('data-tab');
                showAdminTab(tab, activeTab);
            }
        }
    }
}

// API configuration
const API_BASE = window.location.origin + '/api';

// Debug logging
console.log('API Base URL:', API_BASE);
console.log('Current origin:', window.location.origin);

// Utility functions
function showLoading() {
    document.getElementById('loading-overlay').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading-overlay').classList.add('hidden');
}

function showToast(title, message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
    `;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// API functions
async function apiRequest(endpoint, method = 'GET', data = null, isFormData = false) {
    const url = `${API_BASE}${endpoint}`;
    console.log(`Making ${method} request to:`, url);
    
    const options = {
        method,
        headers: {}
    };

    if (currentUser && currentUser.token) {
        options.headers['Authorization'] = `Bearer ${currentUser.token}`;
    }

    if (data) {
        if (isFormData) {
            options.body = data;
        } else {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(data);
        }
    }

    try {
        const response = await fetch(url, options);
        console.log(`Response status for ${endpoint}:`, response.status);
        
        const result = await response.json();
        
        if (!response.ok) {
            console.error(`API Error for ${endpoint}:`, result);
            throw new Error(result.message || 'Request failed');
        }
        
        return result;
    } catch (error) {
        console.error(`API request error for ${endpoint}:`, error);
        console.error('Full error details:', {
            url,
            method,
            error: error.message,
            stack: error.stack
        });
        throw error;
    }
}

// Authentication functions
async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        showToast('Error', 'Please enter both username and password', 'error');
        return;
    }

    try {
        showLoading();
        const response = await apiRequest('/auth/login', 'POST', { username, password });
        
        currentUser = response;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Show admin options if user is admin
        if (currentUser.user.role === 'admin') {
            document.querySelectorAll('.admin-only').forEach(el => {
                el.classList.add('show');
            });
        }
        
        showScreen('dashboard-screen');
        showToast('Success', 'Logged in successfully');
    } catch (error) {
        showToast('Error', error.message, 'error');
    } finally {
        hideLoading();
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    document.querySelectorAll('.admin-only').forEach(el => {
        el.classList.remove('show');
    });
    showScreen('login-screen');
    showToast('Success', 'Logged out successfully');
}

// MBV Upload functions
function handleMBVUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const preview = document.getElementById('mbv-preview');
    const image = document.getElementById('mbv-preview-image');
    const spinner = document.getElementById('processing-spinner');
    const text = document.getElementById('processing-text');
    
    // Show preview
    image.src = URL.createObjectURL(file);
    preview.classList.remove('hidden');
    spinner.classList.remove('hidden');
    text.textContent = 'Processing...';
    
    // Upload and process
    uploadMBVImage(file);
}

async function uploadMBVImage(file) {
    try {
        const formData = new FormData();
        formData.append('mbvImage', file);
        
        const response = await apiRequest('/items/upload-mbv', 'POST', formData, true);
        
        // Hide spinner and show extracted info
        document.getElementById('processing-spinner').classList.add('hidden');
        document.getElementById('processing-text').textContent = 'Processing complete';
        
        // Populate extracted information
        document.getElementById('storage-location').value = response.extractedInfo.storageLocation || '';
        document.getElementById('part-number').value = response.extractedInfo.partNumber || '';
        document.getElementById('serial-number').value = response.extractedInfo.serialNumber || '';
        
        // Show extracted info form
        document.getElementById('extracted-info').classList.remove('hidden');
        
        // Store image URL for later use
        document.getElementById('extracted-info').dataset.imageUrl = response.imageUrl;
        
        showToast('Success', 'MBV processed successfully');
    } catch (error) {
        document.getElementById('processing-spinner').classList.add('hidden');
        document.getElementById('processing-text').textContent = 'Processing failed';
        showToast('Error', error.message, 'error');
    }
}

async function createItem() {
    const storageLocation = document.getElementById('storage-location').value;
    const partNumber = document.getElementById('part-number').value;
    const serialNumber = document.getElementById('serial-number').value;
    const itemType = document.getElementById('item-type').value;
    const mbvImageUrl = document.getElementById('extracted-info').dataset.imageUrl;

    if (!storageLocation || !partNumber || !serialNumber) {
        showToast('Error', 'Please fill in all required fields', 'error');
        return;
    }

    try {
        showLoading();
        const response = await apiRequest('/items/create', 'POST', {
            storageLocation,
            partNumber,
            serialNumber,
            itemType,
            mbvImageUrl
        });
        
        showToast('Success', 'Item created successfully');
        
        // Reset form
        document.getElementById('mbv-file').value = '';
        document.getElementById('mbv-preview').classList.add('hidden');
        document.getElementById('extracted-info').classList.add('hidden');
        
        // Redirect to my items
        loadMyItems();
        showScreen('my-items-screen');
    } catch (error) {
        showToast('Error', error.message, 'error');
    } finally {
        hideLoading();
    }
}

// My Items functions
async function loadMyItems() {
    try {
        showLoading();
        const items = await apiRequest('/items/my-items');
        
        const container = document.getElementById('items-list');
        container.innerHTML = '';
        
        if (items.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); margin-top: 40px;">No items found</p>';
            return;
        }
        
        items.forEach(item => {
            const itemCard = createItemCard(item);
            container.appendChild(itemCard);
        });
    } catch (error) {
        showToast('Error', error.message, 'error');
    } finally {
        hideLoading();
    }
}

function createItemCard(item) {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => showItemDetail(item._id));
    
    card.innerHTML = `
        <div class="item-header">
            <div class="item-id">${item.mbvId}</div>
            <div class="item-status status-${item.status.replace(/_/g, '_')}">${item.status.replace(/_/g, ' ')}</div>
        </div>
        <div class="item-details">
            <div class="item-detail">
                <label>Storage Location</label>
                <span>${item.storageLocation}</span>
            </div>
            <div class="item-detail">
                <label>Part Number</label>
                <span>${item.partNumber}</span>
            </div>
            <div class="item-detail">
                <label>Serial Number</label>
                <span>${item.serialNumber}</span>
            </div>
            <div class="item-detail">
                <label>Forwarder</label>
                <span>${item.forwarder || 'Not set'}</span>
            </div>
        </div>
    `;
    
    return card;
}

async function showItemDetail(itemId) {
    try {
        showLoading();
        const item = await apiRequest(`/items/${itemId}`);
        currentItem = item;
        
        const container = document.getElementById('item-details');
        container.innerHTML = `
            <div class="form-section">
                <h3>Item Information</h3>
                <div class="item-details">
                    <div class="item-detail">
                        <label>MBV ID</label>
                        <span>${item.mbvId}</span>
                    </div>
                    <div class="item-detail">
                        <label>Storage Location</label>
                        <span>${item.storageLocation}</span>
                    </div>
                    <div class="item-detail">
                        <label>Part Number</label>
                        <span>${item.partNumber}</span>
                    </div>
                    <div class="item-detail">
                        <label>Serial Number</label>
                        <span>${item.serialNumber}</span>
                    </div>
                    <div class="item-detail">
                        <label>Item Type</label>
                        <span>${item.itemType}</span>
                    </div>
                    <div class="item-detail">
                        <label>Forwarder</label>
                        <span>${item.forwarder}</span>
                    </div>
                    <div class="item-detail">
                        <label>Status</label>
                        <span class="item-status status-${item.status.replace(/_/g, '_')}">${item.status.replace(/_/g, ' ')}</span>
                    </div>
                </div>
            </div>
            ${item.status === 'processing' ? createChecklist(item) : ''}
            ${item.status === 'processed' ? createStatusUpdate(item) : ''}
        `;
        
        showScreen('item-detail-screen');
        
        // Add event listeners for dynamically created elements
        setTimeout(() => {
            // Checklist items
            document.querySelectorAll('.checklist-item[data-checklist-key]').forEach(item => {
                item.addEventListener('click', () => {
                    toggleChecklistItem(item.dataset.checklistKey);
                });
            });
            
            // Mark available button
            const markAvailableBtn = document.getElementById('mark-available-btn');
            if (markAvailableBtn) {
                markAvailableBtn.addEventListener('click', () => {
                    updateItemStatus('available_for_pickup');
                });
            }
            
            // Set forwarder button
            const setForwarderBtn = document.getElementById('set-forwarder-btn');
            if (setForwarderBtn) {
                setForwarderBtn.addEventListener('click', () => {
                    setItemForwarder();
                });
            }
        }, 100);
    } catch (error) {
        showToast('Error', error.message, 'error');
    } finally {
        hideLoading();
    }
}

function createChecklist(item) {
    const checklistItems = [
        { key: 'itemPicked', label: 'Item Picked from Storage' },
        { key: 'identityVerified', label: 'Item Identity and Integration Check' },
        { key: 'sapOperationDone', label: 'SAP Operation Completed' },
        { key: 'packaged', label: 'Item Packaged' },
        { key: 'photographed', label: 'Item Photographed (if required)', condition: item.itemType === 'EVA' || item.itemType === 'EVERGREEN' },
        { key: 'forwarderBooked', label: 'Forwarder/Courier Booked', showAfterSAP: true },
        { key: 'placedInDesignatedArea', label: 'Item Placed in Designated Area' }
    ];
    
    let checklistHtml = '<div class="form-section"><h3>Process Checklist</h3><div class="checklist">';
    
    checklistItems.forEach(checkItem => {
        // Skip photographed step if not EVA or EVERGREEN
        if (checkItem.key === 'photographed' && checkItem.condition === false) {
            return;
        }
        
        // Show forwarder booking only after SAP operation is completed
        if (checkItem.showAfterSAP && !item.checklist.sapOperationDone) {
            return;
        }
        
        const isChecked = item.checklist[checkItem.key];
        checklistHtml += `
            <div class="checklist-item ${isChecked ? 'completed' : ''}" data-checklist-key="${checkItem.key}" style="cursor: pointer;">
                <div class="checklist-checkbox ${isChecked ? 'checked' : ''}"></div>
                <div class="checklist-label">${checkItem.label}</div>
            </div>
        `;
    });
    
    checklistHtml += '</div>';
    
    // Add forwarder selection after SAP operation is completed
    if (item.checklist.sapOperationDone && !item.forwarder) {
        checklistHtml += `
            <div class="form-section" style="margin-top: 20px;">
                <h4>Select Forwarder/Courier</h4>
                <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 16px;">
                    Please select a forwarder to continue with the process.
                </p>
                <div class="form-group">
                    <label for="item-forwarder">Forwarder</label>
                    <select id="item-forwarder">
                        <option value="">Select Forwarder</option>
                        <option value="DHL">DHL</option>
                        <option value="FEDEX">FEDEX</option>
                        <option value="UPS">UPS</option>
                        <option value="CRANE">CRANE</option>
                        <option value="MNX">MNX</option>
                        <option value="AOC">AOC</option>
                        <option value="STERLING">STERLING</option>
                        <option value="OTHERS">OTHERS</option>
                    </select>
                </div>
                <button class="btn btn-secondary" id="set-forwarder-btn">Set Forwarder</button>
            </div>
        `;
    } else if (item.forwarder) {
        checklistHtml += `
            <div class="form-section" style="margin-top: 20px;">
                <h4>Forwarder/Courier</h4>
                <p style="color: var(--success); font-weight: 500;">${item.forwarder} selected</p>
            </div>
        `;
    }
    
    return checklistHtml;
}

function createStatusUpdate(item) {
    // Check if all required items are completed
    const requiredItems = ['itemPicked', 'identityVerified', 'sapOperationDone', 'packaged', 'placedInDesignatedArea'];
    
    // Add photographed if item is EVA or EVERGREEN
    if (item.itemType === 'EVA' || item.itemType === 'EVERGREEN') {
        requiredItems.push('photographed');
    }
    
    // Add forwarderBooked if forwarder is set
    if (item.forwarder) {
        requiredItems.push('forwarderBooked');
    }
    
    const allCompleted = requiredItems.every(key => item.checklist[key] === true);
    const hasForwarder = item.forwarder && item.forwarder !== '';
    
    if (!allCompleted || !hasForwarder) {
        return `
            <div class="form-section">
                <h3>Status Update</h3>
                <p style="margin-bottom: 16px; color: var(--error);">
                    Complete all checklist items and set a forwarder before marking as available for pickup.
                </p>
            </div>
        `;
    }
    
    return `
        <div class="form-section">
            <h3>Status Update</h3>
            <p style="margin-bottom: 16px; color: var(--text-secondary);">Confirm booking has been made to forwarder/courier and the item is ready for pickup.</p>
            <button class="btn btn-primary" id="mark-available-btn">Confirm and Proceed</button>
        </div>
    `;
}

async function toggleChecklistItem(checklistKey) {
    if (!currentItem) return;
    
    try {
        const newValue = !currentItem.checklist[checklistKey];
        await apiRequest(`/items/${currentItem._id}/checklist`, 'PUT', {
            checklistItem: checklistKey,
            value: newValue
        });
        
        // Refresh item detail
        showItemDetail(currentItem._id);
        showToast('Success', 'Checklist updated');
    } catch (error) {
        showToast('Error', error.message, 'error');
    }
}

async function updateItemStatus(status) {
    if (!currentItem) return;
    
    try {
        await apiRequest(`/items/${currentItem._id}`, 'PUT', { status });
        showItemDetail(currentItem._id);
        showToast('Success', 'Status updated successfully');
    } catch (error) {
        showToast('Error', error.message, 'error');
    }
}

async function setItemForwarder() {
    if (!currentItem) return;
    
    const forwarder = document.getElementById('item-forwarder').value;
    if (!forwarder) {
        showToast('Error', 'Please select a forwarder', 'error');
        return;
    }
    
    try {
        showLoading();
        await apiRequest(`/items/${currentItem._id}`, 'PUT', { forwarder });
        
        // Refresh the item details to show updated state
        showItemDetail(currentItem._id);
        showToast('Success', 'Forwarder set successfully. You can now complete the remaining checklist items.');
    } catch (error) {
        showToast('Error', error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Transfer functions
async function loadForwarders() {
    try {
        showLoading();
        const forwarders = await apiRequest('/transfers/forwarders');
        
        const container = document.getElementById('forwarders-list');
        container.innerHTML = '';
        
        if (forwarders.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); margin-top: 40px;">No items available for pickup</p>';
            return;
        }
        
        forwarders.forEach(forwarder => {
            const card = document.createElement('div');
            card.className = 'forwarder-card';
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => showTransferItems(forwarder._id));
            
            card.innerHTML = `
                <div class="forwarder-name">${forwarder._id}</div>
                <div class="forwarder-count">${forwarder.count} items</div>
            `;
            
            container.appendChild(card);
        });
    } catch (error) {
        showToast('Error', error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function showTransferItems(forwarder) {
    try {
        showLoading();
        currentForwarder = forwarder;
        
        const items = await apiRequest(`/transfers/available/${forwarder}`);
        
        document.getElementById('transfer-forwarder-title').textContent = `${forwarder} - Items for Transfer`;
        
        const container = document.getElementById('transfer-items-list');
        container.innerHTML = '';
        
        if (items.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); margin-top: 40px;">No items available for pickup</p>';
            return;
        }
        
        items.forEach(item => {
            const itemCard = createTransferItemCard(item);
            container.appendChild(itemCard);
        });
        
        showScreen('transfer-items-screen');
    } catch (error) {
        showToast('Error', error.message, 'error');
    } finally {
        hideLoading();
    }
}

function createTransferItemCard(item) {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => showTagVerification(item._id));
    
    card.innerHTML = `
        <div class="item-header">
            <div class="item-id">${item.mbvId}</div>
            <div class="item-status status-${item.status.replace(/_/g, '_')}">${item.status.replace(/_/g, ' ')}</div>
        </div>
        <div class="item-details">
            <div class="item-detail">
                <label>Storage Location</label>
                <span>${item.storageLocation}</span>
            </div>
            <div class="item-detail">
                <label>Part Number</label>
                <span>${item.partNumber}</span>
            </div>
            <div class="item-detail">
                <label>Serial Number</label>
                <span>${item.serialNumber}</span>
            </div>
            <div class="item-detail">
                <label>Operator</label>
                <span>${item.operatorId.fullName}</span>
            </div>
        </div>
    `;
    
    return card;
}

function showTagVerification(itemId) {
    currentTransferItemId = itemId;
    currentTagData = null;
    
    // Reset form completely
    document.getElementById('picker-name').value = '';
    document.getElementById('picker-id').value = '';
    document.getElementById('car-plate').value = '';
    document.getElementById('tag-file').value = '';
    document.getElementById('tag-preview').classList.add('hidden');
    document.getElementById('verification-comparison').classList.add('hidden');
    
    showScreen('tag-verification-screen');
}

function handleTagUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const preview = document.getElementById('tag-preview');
    const image = document.getElementById('tag-preview-image');
    
    // Show preview
    image.src = URL.createObjectURL(file);
    preview.classList.remove('hidden');
}

let currentTagData = null;

async function processTag() {
    const tagFile = document.getElementById('tag-file').files[0];

    if (!tagFile) {
        showToast('Error', 'Please upload a tag photo', 'error');
        return;
    }

    try {
        showLoading();
        
        const formData = new FormData();
        formData.append('tagPhoto', tagFile);
        
        const response = await apiRequest(`/transfers/process-tag/${currentTransferItemId}`, 'POST', formData, true);
        
        currentTagData = response;
        showVerificationComparison(response);
        
    } catch (error) {
        showToast('Error', error.message, 'error');
    } finally {
        hideLoading();
    }
}

function showVerificationComparison(data) {
    const comparisonDiv = document.getElementById('verification-comparison');
    const resultsDiv = document.getElementById('comparison-results');
    
    const { comparison } = data;
    const overallMatch = comparison.overallMatch;
    
    let warningHtml = '';
    if (!overallMatch) {
        warningHtml = `
            <div class="verification-warning">
                <span class="warning-icon">⚠️</span>
                Tag verification failed. Please review the comparison below and manually verify the information before proceeding.
            </div>
        `;
    }
    
    resultsDiv.innerHTML = `
        ${warningHtml}
        <div class="verification-comparison ${overallMatch ? 'match' : 'mismatch'}">
            <div class="comparison-row">
                <div class="comparison-field">Storage Location</div>
                <div class="comparison-values">
                    <div class="comparison-value extracted">Extracted: ${comparison.storage.extracted || 'Not detected'}</div>
                    <div class="comparison-value expected">Expected: ${comparison.storage.expected}</div>
                </div>
                <div class="comparison-status ${comparison.storage.match ? 'match' : 'mismatch'}">
                    ${comparison.storage.match ? '✓ Match' : '✗ Mismatch'}
                </div>
            </div>
            <div class="comparison-row">
                <div class="comparison-field">Part Number</div>
                <div class="comparison-values">
                    <div class="comparison-value extracted">Extracted: ${comparison.part.extracted || 'Not detected'}</div>
                    <div class="comparison-value expected">Expected: ${comparison.part.expected}</div>
                </div>
                <div class="comparison-status ${comparison.part.match ? 'match' : 'mismatch'}">
                    ${comparison.part.match ? '✓ Match' : '✗ Mismatch'}
                </div>
            </div>
            <div class="comparison-row">
                <div class="comparison-field">Serial Number</div>
                <div class="comparison-values">
                    <div class="comparison-value extracted">Extracted: ${comparison.serial.extracted || 'Not detected'}</div>
                    <div class="comparison-value expected">Expected: ${comparison.serial.expected}</div>
                </div>
                <div class="comparison-status ${comparison.serial.match ? 'match' : 'mismatch'}">
                    ${comparison.serial.match ? '✓ Match' : '✗ Mismatch'}
                </div>
            </div>
        </div>
    `;
    
    comparisonDiv.classList.remove('hidden');
    
    // Update button text based on match status
    const confirmBtn = document.getElementById('confirm-verification-btn');
    if (overallMatch) {
        confirmBtn.textContent = 'Confirm Transfer';
        confirmBtn.className = 'btn btn-primary';
    } else {
        confirmBtn.textContent = 'Override & Complete Transfer';
        confirmBtn.className = 'btn btn-warning';
    }
}

async function confirmTransfer() {
    const pickerName = document.getElementById('picker-name').value;
    const pickerId = document.getElementById('picker-id').value;
    const carPlate = document.getElementById('car-plate').value;

    if (!pickerName || !pickerId) {
        showToast('Error', 'Please fill in picker name and ID', 'error');
        return;
    }

    if (!currentTagData) {
        showToast('Error', 'Please process the tag photo first', 'error');
        return;
    }

    try {
        showLoading();
        
        const response = await apiRequest(`/transfers/complete-transfer/${currentTransferItemId}`, 'POST', {
            pickerName,
            pickerId,
            carPlate,
            tagPhotoUrl: currentTagData.tagPhotoUrl,
            verificationOverride: !currentTagData.comparison.overallMatch
        });
        
        showToast('Success', 'Transfer completed successfully');
        
        // Reset transfer state
        currentTransferItemId = null;
        currentTagData = null;
        
        // Go back to transfer items and refresh the list
        if (currentForwarder) {
            showTransferItems(currentForwarder);
        } else {
            // Fallback to main transfers screen
            showScreen('transfers-screen');
            loadForwarders();
        }
    } catch (error) {
        showToast('Error', error.message, 'error');
    } finally {
        hideLoading();
    }
}

function rejectVerification() {
    // Reset the form to allow retaking photo
    document.getElementById('tag-file').value = '';
    document.getElementById('tag-preview').classList.add('hidden');
    document.getElementById('verification-comparison').classList.add('hidden');
    currentTagData = null;
    
    showToast('Info', 'Please retake the tag photo', 'info');
}

function goBackToTransferItems() {
    // Reset any transfer state
    currentTransferItemId = null;
    currentTagData = null;
    
    // Clear form
    document.getElementById('picker-name').value = '';
    document.getElementById('picker-id').value = '';
    document.getElementById('car-plate').value = '';
    document.getElementById('tag-file').value = '';
    document.getElementById('tag-preview').classList.add('hidden');
    document.getElementById('verification-comparison').classList.add('hidden');
    
    if (currentForwarder) {
        showTransferItems(currentForwarder);
    } else {
        showScreen('transfers-screen');
        loadForwarders();
    }
}

// Admin functions
async function showAdminTab(tab, targetElement) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if (targetElement) {
        targetElement.classList.add('active');
    }
    
    const content = document.getElementById('admin-content');
    
    switch (tab) {
        case 'users':
            await loadUsers();
            break;
        case 'items':
            await loadAllItems();
            break;
        case 'dashboard':
            await loadDashboard();
            break;
    }
}

async function loadUsers() {
    try {
        showLoading();
        const users = await apiRequest('/admin/users');
        
        const content = document.getElementById('admin-content');
        content.innerHTML = `
            <div class="form-section">
                <h3>Create New User</h3>
                <div class="form-group">
                    <label>Username</label>
                    <input type="text" id="new-username" placeholder="Enter username">
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="new-email" placeholder="Enter email">
                </div>
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" id="new-fullname" placeholder="Enter full name">
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" id="new-password" placeholder="Enter password">
                </div>
                <div class="form-group">
                    <label>Role</label>
                    <select id="new-role">
                        <option value="operator">Operator</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <button class="btn btn-primary" id="create-user-btn">Create User</button>
            </div>
            <div class="form-section">
                <h3>Existing Users</h3>
                <div id="users-list"></div>
            </div>
        `;
        
        const usersList = document.getElementById('users-list');
        users.forEach(user => {
            const userCard = document.createElement('div');
            userCard.className = 'item-card';
            userCard.innerHTML = `
                <div class="item-header">
                    <div class="item-id">${user.username}</div>
                    <div class="item-status status-${user.isActive ? 'processed' : 'pending'}">${user.isActive ? 'Active' : 'Inactive'}</div>
                </div>
                <div class="item-details">
                    <div class="item-detail">
                        <label>Full Name</label>
                        <span>${user.fullName}</span>
                    </div>
                    <div class="item-detail">
                        <label>Email</label>
                        <span>${user.email}</span>
                    </div>
                    <div class="item-detail">
                        <label>Role</label>
                        <span>${user.role}</span>
                    </div>
                    <div class="item-detail">
                        <label>Created</label>
                        <span>${new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
            `;
            usersList.appendChild(userCard);
        });
        
        // Add event listener for create user button
        setTimeout(() => {
            const createUserBtn = document.getElementById('create-user-btn');
            if (createUserBtn) {
                createUserBtn.addEventListener('click', createUser);
            }
        }, 100);
    } catch (error) {
        showToast('Error', error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function createUser() {
    const username = document.getElementById('new-username').value;
    const email = document.getElementById('new-email').value;
    const fullName = document.getElementById('new-fullname').value;
    const password = document.getElementById('new-password').value;
    const role = document.getElementById('new-role').value;

    if (!username || !email || !fullName || !password) {
        showToast('Error', 'Please fill in all fields', 'error');
        return;
    }

    try {
        showLoading();
        await apiRequest('/admin/users', 'POST', {
            username,
            email,
            fullName,
            password,
            role
        });
        
        showToast('Success', 'User created successfully');
        loadUsers(); // Refresh the users list
    } catch (error) {
        showToast('Error', error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function loadAllItems(searchParams = {}) {
    try {
        showLoading();
        
        // Build query parameters
        const params = new URLSearchParams();
        if (searchParams.search) params.append('search', searchParams.search);
        if (searchParams.searchType) params.append('searchType', searchParams.searchType);
        if (searchParams.showAll) params.append('showAll', searchParams.showAll);
        if (searchParams.dateFrom) params.append('dateFrom', searchParams.dateFrom);
        if (searchParams.dateTo) params.append('dateTo', searchParams.dateTo);
        
        const queryString = params.toString();
        const url = '/admin/items' + (queryString ? '?' + queryString : '');
        const response = await apiRequest(url);
        
        const content = document.getElementById('admin-content');
        content.innerHTML = `
            <div class="form-section">
                <h3>${t('itemsManagement')}</h3>
                
                <!-- Search and Filter Controls -->
                <div class="admin-controls">
                    <div class="search-controls">
                        <div class="form-group">
                            <label for="admin-search">${t('searchItems')}</label>
                            <div class="search-input-group">
                                <input type="text" id="admin-search" placeholder="Enter Serial Number or Part Number" value="${searchParams.search || ''}">
                                <select id="admin-search-type">
                                    <option value="both" ${searchParams.searchType === 'both' ? 'selected' : ''}>SN + PN</option>
                                    <option value="sn" ${searchParams.searchType === 'sn' ? 'selected' : ''}>${t('serialNumber')}</option>
                                    <option value="pn" ${searchParams.searchType === 'pn' ? 'selected' : ''}>${t('partNumber')}</option>
                                </select>
                                <button class="btn btn-primary" id="admin-search-btn">${t('search')}</button>
                            </div>
                        </div>
                        
                        <div class="date-controls">
                            <div class="form-group">
                                <label>
                                    <input type="checkbox" id="show-all-items" ${searchParams.showAll ? 'checked' : ''}> 
                                    ${t('showAllItems')}
                                </label>
                            </div>
                            <div class="form-group">
                                <label for="date-from">${t('fromDate')}</label>
                                <input type="date" id="date-from" value="${searchParams.dateFrom || ''}">
                            </div>
                            <div class="form-group">
                                <label for="date-to">${t('toDate')}</label>
                                <input type="date" id="date-to" value="${searchParams.dateTo || ''}">
                            </div>
                            <button class="btn btn-secondary" id="admin-filter-btn">${t('applyFilter')}</button>
                            <button class="btn btn-secondary" id="admin-clear-btn">${t('clear')}</button>
                        </div>
                    </div>
                    
                    <!-- Export Controls -->
                    <div class="export-controls">
                        <h4>${t('exportData')}</h4>
                        <div class="export-date-range">
                            <div class="form-group">
                                <label for="export-from">${t('exportFrom')}</label>
                                <input type="date" id="export-from">
                            </div>
                            <div class="form-group">
                                <label for="export-to">${t('exportTo')}</label>
                                <input type="date" id="export-to">
                            </div>
                            <button class="btn btn-success" id="export-btn">📊 ${t('exportToCSV')}</button>
                        </div>
                    </div>
                </div>
                
                <!-- Results Info -->
                <div class="results-info">
                    <p>Showing ${response.items.length} of ${response.total} items</p>
                </div>
                
                <div id="admin-items-list"></div>
            </div>
        `;
        
        const itemsList = document.getElementById('admin-items-list');
        response.items.forEach(item => {
            const itemCard = createAdminItemCard(item);
            itemsList.appendChild(itemCard);
        });
        
        // Add event listeners for controls
        setTimeout(() => {
            const searchBtn = document.getElementById('admin-search-btn');
            const filterBtn = document.getElementById('admin-filter-btn');
            const clearBtn = document.getElementById('admin-clear-btn');
            const exportBtn = document.getElementById('export-btn');
            const searchInput = document.getElementById('admin-search');
            
            if (searchBtn) {
                searchBtn.addEventListener('click', performAdminSearch);
            }
            
            if (filterBtn) {
                filterBtn.addEventListener('click', applyAdminFilter);
            }
            
            if (clearBtn) {
                clearBtn.addEventListener('click', clearAdminFilters);
            }
            
            if (exportBtn) {
                exportBtn.addEventListener('click', exportAdminData);
            }
            
            if (searchInput) {
                searchInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        performAdminSearch();
                    }
                });
            }
        }, 100);
        
    } catch (error) {
        showToast('Error', error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Admin search and filter functions
function performAdminSearch() {
    const search = document.getElementById('admin-search').value.trim();
    const searchType = document.getElementById('admin-search-type').value;
    const showAll = document.getElementById('show-all-items').checked;
    const dateFrom = document.getElementById('date-from').value;
    const dateTo = document.getElementById('date-to').value;
    
    loadAllItems({
        search,
        searchType,
        showAll,
        dateFrom,
        dateTo
    });
}

function applyAdminFilter() {
    const showAll = document.getElementById('show-all-items').checked;
    const dateFrom = document.getElementById('date-from').value;
    const dateTo = document.getElementById('date-to').value;
    
    loadAllItems({
        showAll,
        dateFrom,
        dateTo
    });
}

function clearAdminFilters() {
    document.getElementById('admin-search').value = '';
    document.getElementById('admin-search-type').value = 'both';
    document.getElementById('show-all-items').checked = false;
    document.getElementById('date-from').value = '';
    document.getElementById('date-to').value = '';
    
    loadAllItems();
}

async function exportAdminData() {
    const exportFrom = document.getElementById('export-from').value;
    const exportTo = document.getElementById('export-to').value;
    
    if (!exportFrom && !exportTo) {
        showToast('Error', 'Please select at least one date for export range', 'error');
        return;
    }
    
    try {
        showLoading();
        
        // Build export URL
        const params = new URLSearchParams();
        if (exportFrom) params.append('dateFrom', exportFrom);
        if (exportTo) params.append('dateTo', exportTo);
        
        const exportUrl = `${API_BASE}/admin/export?${params.toString()}`;
        
        // Create a temporary link to download the file
        const link = document.createElement('a');
        link.href = exportUrl;
        link.download = `warehouse_export_${new Date().toISOString().slice(0, 10)}.csv`;
        
        // Add authorization header by fetching and creating blob
        const response = await fetch(exportUrl, {
            headers: {
                'Authorization': `Bearer ${currentUser.token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Export failed');
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        showToast('Success', 'Export completed successfully');
        
    } catch (error) {
        console.error('Export error:', error);
        showToast('Error', 'Failed to export data: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

function createAdminItemCard(item) {
    const card = document.createElement('div');
    card.className = 'item-card';
    
    // Create operation history HTML
    let operationHistoryHtml = '';
    if (item.operationHistory && item.operationHistory.length > 0) {
        operationHistoryHtml = `
            <div class="item-detail">
                <label>Operation History</label>
                <div class="operation-history">
                    ${item.operationHistory.map(op => `
                        <div class="operation-item">
                            <span class="operation-name">${op.operation}</span>
                            <span class="operator-name">${op.operatorId ? op.operatorId.fullName : 'Unknown'}</span>
                            <span class="operation-time">${new Date(op.timestamp).toLocaleString()}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    card.innerHTML = `
        <div class="item-header">
            <div class="item-id">${item.mbvId}</div>
            <div class="item-status status-${item.status.replace(/_/g, '_')}">${item.status.replace(/_/g, ' ')}</div>
            <div style="margin-left: auto; display: flex; gap: 8px;">
                <button class="btn btn-secondary btn-sm update-status-btn" data-item-id="${item._id}" data-current-status="${item.status}">
                    📝 Status
                </button>
                <button class="btn btn-danger btn-sm delete-item-btn" data-item-id="${item._id}">
                    🗑️ Delete
                </button>
            </div>
        </div>
        <div class="item-details">
            <div class="item-detail">
                <label>Storage Location</label>
                <span>${item.storageLocation}</span>
            </div>
            <div class="item-detail">
                <label>Part Number</label>
                <span>${item.partNumber}</span>
            </div>
            <div class="item-detail">
                <label>Serial Number</label>
                <span>${item.serialNumber}</span>
            </div>
            <div class="item-detail">
                <label>Operator</label>
                <span>${item.operatorId ? item.operatorId.fullName : 'Unknown'}</span>
            </div>
            <div class="item-detail">
                <label>Forwarder</label>
                <span>${item.forwarder || 'Not set'}</span>
            </div>
            ${operationHistoryHtml}
        </div>
    `;
    
    // Add click event listeners
    const deleteBtn = card.querySelector('.delete-item-btn');
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showDeleteConfirmation(item);
    });
    
    const updateStatusBtn = card.querySelector('.update-status-btn');
    updateStatusBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showAdminStatusUpdateModal(item);
    });
    
    return card;
}

function showDeleteConfirmation(item) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3>⚠️ Delete Item</h3>
            </div>
            <div class="modal-content">
                <p><strong>Are you sure you want to permanently delete this item?</strong></p>
                <div class="item-summary">
                    <p><strong>MBV ID:</strong> ${item.mbvId}</p>
                    <p><strong>Part Number:</strong> ${item.partNumber}</p>
                    <p><strong>Serial Number:</strong> ${item.serialNumber}</p>
                    <p><strong>Status:</strong> ${item.status.replace(/_/g, ' ')}</p>
                </div>
                <p style="color: var(--error); font-size: 14px; margin-top: 16px;">
                    This action cannot be undone. The item record will be permanently removed from the system.
                </p>
            </div>
            <div class="modal-actions">
                <button class="btn btn-secondary" id="cancel-delete">Cancel</button>
                <button class="btn btn-danger" id="confirm-delete">Delete Item</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('cancel-delete').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    document.getElementById('confirm-delete').addEventListener('click', () => {
        document.body.removeChild(modal);
        deleteItem(item._id);
    });
    
    // Close on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

async function deleteItem(itemId) {
    try {
        showLoading();
        const response = await apiRequest(`/admin/items/${itemId}`, 'DELETE');
        
        showToast('Success', `Item ${response.deletedItem.mbvId} deleted successfully`);
        
        // Refresh the items list
        loadAllItems();
    } catch (error) {
        showToast('Error', error.message, 'error');
    } finally {
        hideLoading();
    }
}

function showAdminStatusUpdateModal(item) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3>📝 Update Item Status</h3>
            </div>
            <div class="modal-content">
                <div class="item-summary">
                    <p><strong>MBV ID:</strong> ${item.mbvId}</p>
                    <p><strong>Part Number:</strong> ${item.partNumber}</p>
                    <p><strong>Current Status:</strong> ${item.status.replace(/_/g, ' ')}</p>
                </div>
                <div class="form-group">
                    <label for="new-status">New Status</label>
                    <select id="new-status">
                        <option value="pending" ${item.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="processing" ${item.status === 'processing' ? 'selected' : ''}>Processing</option>
                        <option value="processed" ${item.status === 'processed' ? 'selected' : ''}>Processed</option>
                        <option value="available_for_pickup" ${item.status === 'available_for_pickup' ? 'selected' : ''}>Available for Pickup</option>
                        <option value="shipped" ${item.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                    </select>
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn btn-secondary" id="cancel-status-update">Cancel</button>
                <button class="btn btn-primary" id="confirm-status-update">Update Status</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('cancel-status-update').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    document.getElementById('confirm-status-update').addEventListener('click', () => {
        const newStatus = document.getElementById('new-status').value;
        document.body.removeChild(modal);
        updateAdminItemStatus(item._id, newStatus);
    });
    
    // Close on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

async function updateAdminItemStatus(itemId, status) {
    try {
        showLoading();
        await apiRequest(`/admin/items/${itemId}/status`, 'PUT', { status });
        
        showToast('Success', 'Item status updated successfully');
        
        // Refresh the items list
        loadAllItems();
    } catch (error) {
        showToast('Error', error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function loadDashboard() {
    try {
        showLoading();
        const data = await apiRequest('/admin/dashboard');
        
        const content = document.getElementById('admin-content');
        content.innerHTML = `
            <div class="card-grid">
                <div class="card">
                    <div class="card-icon">📦</div>
                    <h3>Total Items</h3>
                    <p>${data.stats.totalItems}</p>
                </div>
                <div class="card">
                    <div class="card-icon">⏳</div>
                    <h3>Pending Items</h3>
                    <p>${data.stats.pendingItems}</p>
                </div>
                <div class="card">
                    <div class="card-icon">🔄</div>
                    <h3>Processing Items</h3>
                    <p>${data.stats.processingItems}</p>
                </div>
                <div class="card">
                    <div class="card-icon">✅</div>
                    <h3>Processed Items</h3>
                    <p>${data.stats.processedItems}</p>
                </div>
                <div class="card">
                    <div class="card-icon">📦</div>
                    <h3>Available Items</h3>
                    <p>${data.stats.availableItems}</p>
                </div>
                <div class="card">
                    <div class="card-icon">🚚</div>
                    <h3>Shipped Items</h3>
                    <p>${data.stats.shippedItems}</p>
                </div>
                <div class="card">
                    <div class="card-icon">👥</div>
                    <h3>Active Users</h3>
                    <p>${data.stats.activeUsers}</p>
                </div>
            </div>
        `;
    } catch (error) {
        showToast('Error', error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Language switcher functionality
function showLanguageModal() {
    // Remove existing modal if any
    const existingModal = document.querySelector('.language-modal');
    if (existingModal) {
        existingModal.remove();
        return; // Toggle off if already open
    }
    
    const modal = document.createElement('div');
    modal.className = 'language-modal';
    modal.innerHTML = `
        <div class="language-option ${currentLanguage === 'en' ? 'active' : ''}" data-lang="en">
            <span class="language-flag">🇬🇧</span>
            <span>${t('english')}</span>
        </div>
        <div class="language-option ${currentLanguage === 'zh-TW' ? 'active' : ''}" data-lang="zh-TW">
            <span class="language-flag">🇭🇰</span>
            <span>${t('traditionalChinese')}</span>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add click listeners to options
    modal.querySelectorAll('.language-option').forEach(option => {
        option.addEventListener('click', () => {
            const lang = option.getAttribute('data-lang');
            changeLanguage(lang);
            modal.remove();
        });
    });
    
    // Close modal when clicking outside
    setTimeout(() => {
        document.addEventListener('click', function closeModal(e) {
            if (!modal.contains(e.target) && !document.getElementById('language-toggle').contains(e.target)) {
                modal.remove();
                document.removeEventListener('click', closeModal);
            }
        });
    }, 100);
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize language
    initializeLanguage();
    updatePageLanguage();
    
    // Check for saved user
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        if (currentUser.user.role === 'admin') {
            document.querySelectorAll('.admin-only').forEach(el => {
                el.classList.add('show');
            });
        }
        showScreen('dashboard-screen');
    }
    
    // Handle enter key in login form
    document.getElementById('password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            login();
        }
    });
    
    // Add event listeners for buttons
    document.getElementById('login-btn').addEventListener('click', login);
    document.getElementById('logout-btn').addEventListener('click', logout);
    
    // Dashboard cards
    document.querySelectorAll('.card[data-screen]').forEach(card => {
        card.addEventListener('click', () => {
            showScreen(card.dataset.screen);
        });
    });
    
    // Back buttons and navigation buttons
    document.querySelectorAll('[data-screen]').forEach(btn => {
        btn.addEventListener('click', () => {
            showScreen(btn.dataset.screen);
        });
    });
    
    // Special back button for transfer items
    const backToTransferBtn = document.getElementById('back-to-transfer-items');
    if (backToTransferBtn) {
        backToTransferBtn.addEventListener('click', goBackToTransferItems);
    }
    
    // File inputs
    document.getElementById('mbv-file').addEventListener('change', handleMBVUpload);
    document.getElementById('tag-file').addEventListener('change', handleTagUpload);
    
    // Create item button
    document.getElementById('create-item-btn').addEventListener('click', createItem);
    
    // Process tag button
    document.getElementById('process-tag-btn').addEventListener('click', processTag);
    
    // Verification buttons
    document.getElementById('confirm-verification-btn').addEventListener('click', confirmTransfer);
    document.getElementById('reject-verification-btn').addEventListener('click', rejectVerification);
    
    // Admin tabs
    document.querySelectorAll('.tab-btn[data-tab]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            showAdminTab(btn.dataset.tab, btn);
        });
    });
    
    // Language toggle button
    const languageToggle = document.getElementById('language-toggle');
    if (languageToggle) {
        languageToggle.addEventListener('click', showLanguageModal);
    }
});

// Screen-specific load functions
function onScreenShow(screenId) {
    switch (screenId) {
        case 'my-items-screen':
            loadMyItems();
            break;
        case 'transfers-screen':
            loadForwarders();
            break;
        case 'admin-screen':
            if (currentUser && currentUser.user.role === 'admin') {
                showAdminTab('users');
            }
            break;
    }
}

// Override showScreen to call onScreenShow and handle cleanup
const originalShowScreen = showScreen;
showScreen = function(screenId) {
    // Get current active screen before switching
    const currentScreen = document.querySelector('.screen.active');
    
    // Cleanup when leaving tag verification screen
    if (currentScreen && currentScreen.id === 'tag-verification-screen' && screenId !== 'tag-verification-screen') {
        // Reset tag verification state
        currentTransferItemId = null;
        currentTagData = null;
        
        // Clear form
        const pickerName = document.getElementById('picker-name');
        const pickerId = document.getElementById('picker-id');
        const carPlate = document.getElementById('car-plate');
        const tagFile = document.getElementById('tag-file');
        const tagPreview = document.getElementById('tag-preview');
        const verificationComparison = document.getElementById('verification-comparison');
        
        if (pickerName) pickerName.value = '';
        if (pickerId) pickerId.value = '';
        if (carPlate) carPlate.value = '';
        if (tagFile) tagFile.value = '';
        if (tagPreview) tagPreview.classList.add('hidden');
        if (verificationComparison) verificationComparison.classList.add('hidden');
    }
    
    originalShowScreen(screenId);
    onScreenShow(screenId);
};