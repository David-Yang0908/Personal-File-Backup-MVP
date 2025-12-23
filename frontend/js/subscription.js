/**
 * Subscription Module - Dropbex
 * 負責處理：SNS Topic 訂閱檢查、訂閱請求、訂閱提示模態框
 */

// ==========================================
// 1. 檢查訂閱狀態
// ==========================================

/**
 * 檢查使用者是否已訂閱 SNS Topic
 * @param {string} email - 使用者電子郵件
 * @returns {Promise<{isSubscribed: boolean}>} 訂閱狀態
 */
async function checkUserSubscription(email) {
    console.log('[Subscribe] Checking subscription for:', email);
    
    if (!email || !email.includes('@')) {
        console.log('[Subscribe] Invalid email format, skipping check');
        return { isSubscribed: false };
    }

    try {
        const response = await fetch(AWS_CONFIG.apiGatewayUrl + '/check-subscription', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email })
        });

        if (!response.ok) {
            console.error('[Subscribe] API request failed:', response.status, response.statusText);
            return { isSubscribed: false };
        }

        const data = await response.json();
        console.log('[Subscribe] API Response:', data);
        
        const isSubscribed = data.isSubscribed === true;
        console.log('[Subscribe] User is subscribed:', isSubscribed);
        
        return { isSubscribed: isSubscribed };
    } catch (error) {
        console.error('[Subscribe] Error checking subscription:', error);
        return { isSubscribed: false };
    }
}

// ==========================================
// 2. 訂閱 SNS Topic
// ==========================================

/**
 * 為使用者訂閱 SNS Topic
 * @param {string} email - 使用者電子郵件
 * @returns {Promise<{success: boolean, message?: string}>} 訂閱結果
 */
async function subscribeUserEmail(email) {
    console.log('[Subscribe] User clicked confirm, calling subscribe API for:', email);
    
    if (!email || !email.includes('@')) {
        console.error('[Subscribe] Invalid email format');
        return { success: false, message: 'Invalid email format' };
    }

    try {
        const response = await fetch(AWS_CONFIG.apiGatewayUrl + '/subscribe-topic', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('[Subscribe] Subscribe API failed:', response.status, errorData);
            return { success: false, message: errorData.error || 'Subscription request failed' };
        }

        const data = await response.json();
        console.log('[Subscribe] Subscription request sent successfully:', data);
        
        return { success: true, message: data.message || 'Subscription request sent' };
    } catch (error) {
        console.error('[Subscribe] Error subscribing user:', error);
        return { success: false, message: error.message || 'Network error' };
    }
}

// ==========================================
// 3. 顯示訂閱提示模態框
// ==========================================

/**
 * 顯示訂閱提示模態框
 * @param {string} email - 使用者電子郵件
 */
function showSubscriptionPrompt(email) {
    console.log('[Subscribe] Showing subscription prompt for:', email);
    
    // 檢查是否已經有模態框存在
    const existingModal = document.getElementById('subscriptionModal');
    if (existingModal) {
        console.log('[Subscribe] Modal already exists, removing old one');
        existingModal.remove();
    }

    // 創建模態框遮罩
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'subscriptionModalOverlay';
    modalOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    // 創建模態框內容
    const modal = document.createElement('div');
    modal.id = 'subscriptionModal';
    modal.style.cssText = `
        background: white;
        border-radius: 16px;
        padding: 32px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        position: relative;
    `;

    modal.innerHTML = `
        <div style="margin-bottom: 20px;">
            <h2 style="font-size: 20px; font-weight: 600; color: #374151; margin-bottom: 12px;">訂閱通知</h2>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                若您想接收其他人的通知，請到信箱中點選確認信
            </p>
        </div>
        <div style="display: flex; gap: 12px; justify-content: flex-end;">
            <button id="subscriptionConfirmBtn" style="
                background: #667eea;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            " onmouseover="this.style.background='#5568d3'" onmouseout="this.style.background='#667eea'">
                確認
            </button>
        </div>
    `;

    // 點擊遮罩關閉模態框
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            closeSubscriptionModal();
        }
    });

    // 確認按鈕事件
    const confirmBtn = modal.querySelector('#subscriptionConfirmBtn');
    confirmBtn.addEventListener('click', async function() {
        confirmBtn.disabled = true;
        confirmBtn.textContent = '處理中...';
        
        const result = await subscribeUserEmail(email);
        
        if (result.success) {
            showToast('✅', '訂閱請求已發送，請檢查您的信箱');
            closeSubscriptionModal();
        } else {
            showToast('❌', result.message || '訂閱失敗，請稍後再試');
            confirmBtn.disabled = false;
            confirmBtn.textContent = '確認';
        }
    });

    modalOverlay.appendChild(modal);
    document.body.appendChild(modalOverlay);
}

/**
 * 關閉訂閱模態框
 */
function closeSubscriptionModal() {
    const modal = document.getElementById('subscriptionModal');
    const overlay = document.getElementById('subscriptionModalOverlay');
    
    if (modal) modal.remove();
    if (overlay) overlay.remove();
    
    console.log('[Subscribe] Subscription modal closed');
}

// ==========================================
// 4. 統一檢查與提示函數
// ==========================================

/**
 * 檢查訂閱狀態並在需要時顯示提示
 * @param {string} email - 使用者電子郵件
 */
async function checkAndPromptSubscription(email) {
    console.log('[Subscribe] Starting subscription check and prompt flow for:', email);
    
    if (!email || !email.includes('@')) {
        console.log('[Subscribe] Invalid email, skipping subscription check');
        return;
    }

    try {
        const result = await checkUserSubscription(email);
        
        if (result.isSubscribed === false) {
            console.log('[Subscribe] User is not subscribed, showing prompt');
            showSubscriptionPrompt(email);
        } else {
            console.log('[Subscribe] User is already subscribed, no action needed');
        }
    } catch (error) {
        console.error('[Subscribe] Error in checkAndPromptSubscription:', error);
        // 發生錯誤時不顯示任何提示，避免打擾使用者
    }
}

// ==========================================
// 5. 全域綁定
// ==========================================

window.checkUserSubscription = checkUserSubscription;
window.subscribeUserEmail = subscribeUserEmail;
window.showSubscriptionPrompt = showSubscriptionPrompt;
window.checkAndPromptSubscription = checkAndPromptSubscription;
window.closeSubscriptionModal = closeSubscriptionModal;

