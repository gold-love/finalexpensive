/**
 * Supported currencies and their display symbols.
 * Add new currencies here — they'll be reflected app-wide automatically.
 */
export const CURRENCIES = [
    { code: 'USD', label: 'USD ($)',       symbol: '$'  },
    { code: 'EUR', label: 'EUR (€)',       symbol: '€'  },
    { code: 'GBP', label: 'GBP (£)',       symbol: '£'  },
    { code: 'ETB', label: 'ET Birr (Br)', symbol: 'Br' },
    { code: 'KES', label: 'KES (KSh)',     symbol: 'KSh'},
];

/**
 * Returns the display symbol for a given currency code.
 * Falls back to the code itself if not found.
 * @param {string} code - e.g. 'ETB'
 * @returns {string} - e.g. 'Br'
 */
export function getCurrencySymbol(code) {
    const found = CURRENCIES.find(c => c.code === code);
    return found ? found.symbol : (code || '$');
}

/**
 * Formats an amount with the correct currency symbol.
 * @param {number|string} amount
 * @param {string} currencyCode
 * @returns {string} - e.g. 'Br 1,250.00'
 */
export function formatCurrency(amount, currencyCode) {
    const symbol = getCurrencySymbol(currencyCode);
    const num = parseFloat(amount) || 0;
    return `${symbol} ${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
