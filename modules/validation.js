// ============== VALIDATION MODULE ==============

import { displayError, displaySuccess } from './ui.js';

export const validators = {
    email: function(value) {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}$/;
        if (!value) return { valid: false, message: 'Email is required' };
        if (!regex.test(value)) return { valid: false, message: 'Invalid email format' };
        return { valid: true, message: '' };
    },
    password: function(value) {
        if (!value) {
            return { valid: false, message: 'Password is required' };
        }
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
        if (!regex.test(value)) {
            return {
                valid: false,
                message: 'Password must be at least 8 characters and include uppercase, lowercase, and a number'
            };
        }
        return { valid: true, message: '' };
    },
    name: function(value) {
        if (!value) return { valid: false, message: 'Full name is required' };
        if (value.length < 2) return { valid: false, message: 'Name must be at least 2 characters' };
        if (value.length > 50) return { valid: false, message: 'Name must not exceed 50 characters' };
        if (!/^[a-zA-Z\s]+$/.test(value)) return { valid: false, message: 'Name can only contain letters and spaces' };
        return { valid: true, message: '' };
    },
    phone: function(value) {
        if (!value) return { valid: true, message: '' };
        const regex = /^(\+91)?[6-9]\d{9}$/;
        if (!regex.test(value.replace(/\s/g, ''))) return { valid: false, message: 'Invalid Indian phone number' };
        return { valid: true, message: '' };
    },
    address: function(value) {
        if (!value) return { valid: false, message: 'Address is required' };
        if (value.length < 5) return { valid: false, message: 'Address must be at least 5 characters' };
        return { valid: true, message: '' };
    },
    confirmPassword: function(value, passwordValue) {
        if (!value) return { valid: false, message: 'Confirm password is required' };
        if (value !== passwordValue) return { valid: false, message: 'Passwords do not match' };
        return { valid: true, message: '' };
    }
};

export function getPasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    if (strength < 2) return { level: 'weak', color: '#dc3545', text: 'Weak' };
    if (strength < 4) return { level: 'fair', color: '#fd7e14', text: 'Fair' };
    if (strength < 5) return { level: 'good', color: '#ffc107', text: 'Good' };
    return { level: 'strong', color: '#28a745', text: 'Strong' };
}

export function setupPasswordToggle(formId, passwordInputId) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    const passwordInput = document.getElementById(passwordInputId);
    if (!passwordInput) return;
    
    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'password-toggle';
    toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
    toggleBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        toggleBtn.innerHTML = `<i class="fas fa-eye${isPassword ? '-slash' : ''}"></i>`;
    });
    
    const formGroup = passwordInput.closest('.form-group');
    if (formGroup) {
        formGroup.style.position = 'relative';
        formGroup.appendChild(toggleBtn);
    }
}

export function validateField(fieldId, value, userDatabase = {}, extraValue = null) {
    let result = { valid: true, message: '' };
    
    if (fieldId === 'login-email') {
        result = validators.email(value);
    } else if (fieldId === 'login-password') {
        result = validators.password(value);
    } else if (fieldId === 'signup-name') {
        result = validators.name(value);
    } else if (fieldId === 'signup-email') {
        result = validators.email(value);
        if (result.valid && userDatabase[value.toLowerCase()]) {
            result = { valid: false, message: 'Email already registered' };
        }
    } else if (fieldId === 'signup-password') {
        result = validators.password(value);
    } else if (fieldId === 'signup-confirm-password') {
        result = validators.confirmPassword(value, extraValue);
    } else if (fieldId === 'profile-name') {
        result = validators.name(value);
    } else if (fieldId === 'profile-phone') {
        result = validators.phone(value);
    } else if (fieldId === 'profile-address') {
        result = validators.address(value);
    }
    
    if (result.valid) {
        displaySuccess(fieldId);
    } else {
        displayError(fieldId, result.message);
    }
    
    return result.valid;
}