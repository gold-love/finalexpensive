const validatePasswordComplexity = (password) => {
    // Rules: Min 8 chars, at least 1 uppercase, 1 lowercase, 1 digit, and 1 special character
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
        return { isValid: false, message: 'Password must be at least 8 characters long.' };
    }
    if (!hasUppercase) {
        return { isValid: false, message: 'Password must contain at least one uppercase letter.' };
    }
    if (!hasLowercase) {
        return { isValid: false, message: 'Password must contain at least one lowercase letter.' };
    }
    if (!hasDigit) {
        return { isValid: false, message: 'Password must contain at least one number.' };
    }
    if (!hasSpecialChar) {
        return { isValid: false, message: 'Password must contain at least one special character.' };
    }
    return { isValid: true };
};

module.exports = { validatePasswordComplexity };
