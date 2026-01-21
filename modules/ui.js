// ============== UI UTILITIES MODULE ==============

export function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : '#dc3545'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        font-weight: 500;
    `;
    document.body.appendChild(toast);
    
    setTimeout(function() {
        toast.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(function() { toast.remove(); }, 300);
    }, 3000);
}

export function addCSSAnimations() {
    if (!document.querySelector('style[data-custom]')) {
        const style = document.createElement('style');
        style.setAttribute('data-custom', 'true');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(400px); opacity: 0; }
            }
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            .form-input {
                transition: border-color 0.3s ease, box-shadow 0.3s ease;
            }
            .form-input.valid {
                border-color: #28a745 !important;
                box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.1);
            }
            .form-input.invalid {
                border-color: #dc3545 !important;
                box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
            }
            .error-message {
                color: #dc3545;
                font-size: 12px;
                margin-top: 5px;
                min-height: 18px;
                animation: fadeIn 0.2s ease;
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .password-strength {
                display: flex;
                gap: 3px;
                margin-top: 8px;
            }
            .strength-bar {
                height: 4px;
                flex: 1;
                background: #e0e0e0;
                border-radius: 2px;
                transition: background-color 0.3s ease;
            }
            .strength-text {
                font-size: 11px;
                font-weight: 600;
                margin-top: 5px;
                transition: color 0.3s ease;
            }
            .password-toggle {
                position: absolute;
                right: 12px;
                top: 50%;
                transform: translateY(-50%);
                background: none;
                border: none;
                cursor: pointer;
                color: #666;
                font-size: 18px;
            }
            .btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
            .btn.loading::after {
                content: '';
                position: absolute;
                width: 16px;
                height: 16px;
                top: 50%;
                right: 12px;
                margin-top: -8px;
                border: 2px solid rgba(255,255,255,0.3);
                border-radius: 50%;
                border-top-color: white;
                animation: spin 0.6s linear infinite;
            }
        `;
        document.head.appendChild(style);
    }
}

export function displayError(fieldId, message) {
    const input = document.getElementById(fieldId);
    if (!input) return;
    
    const errorEl = input.parentElement.querySelector('.error-message');
    input.classList.remove('valid');
    input.classList.add('invalid');
    if (errorEl) {
        errorEl.textContent = message;
    }
}

export function displaySuccess(fieldId) {
    const input = document.getElementById(fieldId);
    if (!input) return;
    
    const errorEl = input.parentElement.querySelector('.error-message');
    input.classList.remove('invalid');
    input.classList.add('valid');
    if (errorEl) {
        errorEl.textContent = '';
    }
}