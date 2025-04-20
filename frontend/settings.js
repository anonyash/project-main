// Load saved settings
document.addEventListener('DOMContentLoaded', async () => {
    // Load currency settings
    const savedCurrency = localStorage.getItem('selectedCurrency') || 'INR';
    document.getElementById('default-currency').value = savedCurrency;
    document.getElementById('currency-select').value = savedCurrency;

    // Load theme settings
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.getElementById('theme-select').value = savedTheme;

    // Add event listeners
    document.getElementById('save-currency').addEventListener('click', saveCurrencySettings);
    document.getElementById('save-theme').addEventListener('click', saveThemeSettings);
    document.getElementById('export-data').addEventListener('click', exportData);
    document.getElementById('import-data').addEventListener('click', importData);
    document.getElementById('clear-data').addEventListener('click', clearData);
    document.getElementById('update-rates-btn').addEventListener('click', updateExchangeRates);
    document.getElementById('currency-select').addEventListener('change', handleCurrencyChange);

    // Initialize exchange rates
    await window.fetchExchangeRates();
});

// Handle currency change
async function handleCurrencyChange() {
    const currency = document.getElementById('currency-select').value;
    await window.changeCurrency(currency);
}

// Update exchange rates
async function updateExchangeRates() {
    const updateBtn = document.getElementById('update-rates-btn');
    updateBtn.disabled = true;
    updateBtn.textContent = 'Updating...';
    
    try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        if (!response.ok) throw new Error('Failed to fetch rates');
        
        const data = await response.json();
        // Store rates in localStorage
        saveRates(data.rates);
        // Update global rates
        window.exchangeRates = data.rates;
        
        updateBtn.textContent = 'Rates Updated!';
        setTimeout(() => {
            updateBtn.textContent = 'Update Exchange Rates';
            updateBtn.disabled = false;
        }, 2000);
        
        return true;
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        // Use saved rates if available
        const savedRates = loadRates();
        if (savedRates) {
            window.exchangeRates = savedRates.rates;
            updateBtn.textContent = 'Using Saved Rates';
            setTimeout(() => {
                updateBtn.textContent = 'Update Exchange Rates';
                updateBtn.disabled = false;
            }, 2000);
            return true;
        } else {
            // Use fallback rates if no saved rates
            window.exchangeRates = fallbackRates;
            saveRates(fallbackRates);
            updateBtn.textContent = 'Update Failed';
            setTimeout(() => {
                updateBtn.textContent = 'Update Exchange Rates';
                updateBtn.disabled = false;
            }, 2000);
            return false;
        }
    }
}

// Function to save rates to localStorage
function saveRates(rates) {
    localStorage.setItem('exchangeRates', JSON.stringify(rates));
    localStorage.setItem('ratesLastUpdated', Date.now());
}

// Function to load rates from localStorage
function loadRates() {
    const storedRates = localStorage.getItem('exchangeRates');
    const lastUpdated = localStorage.getItem('ratesLastUpdated');
    
    if (storedRates && lastUpdated) {
        return {
            rates: JSON.parse(storedRates),
            lastUpdated: parseInt(lastUpdated)
        };
    }
    return null;
}

// Fallback exchange rates (as of a recent date)
const fallbackRates = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 151.37,
    INR: 83.25,
    CAD: 1.35,
    CHF: 0.90,
    CNY: 7.24
};

// Save currency settings
function saveCurrencySettings() {
    const defaultCurrency = document.getElementById('default-currency').value;
    const displayCurrency = document.getElementById('currency-select').value;
    
    localStorage.setItem('selectedCurrency', defaultCurrency);
    localStorage.setItem('displayCurrency', displayCurrency);
    
    alert('Currency settings saved!');
}

// Save theme settings
function saveThemeSettings() {
    const theme = document.getElementById('theme-select').value;
    localStorage.setItem('theme', theme);
    applyTheme(theme);
    alert('Theme settings saved!');
}

// Apply theme
// function applyTheme(theme) {
//     if (theme === 'light') {
//         document.body.style.backgroundColor = '#f5f5f5';
//         document.body.style.color = '#333';
//     } else {
//         document.body.style.backgroundColor = '#191919';
//         document.body.style.color = 'white';
//     }
// }

// Export data
function exportData() {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const data = {
        transactions: transactions,
        settings: {
            currency: localStorage.getItem('selectedCurrency'),
            displayCurrency: localStorage.getItem('displayCurrency'),
            theme: localStorage.getItem('theme'),
            exchangeRates: localStorage.getItem('exchangeRates'),
            ratesLastUpdated: localStorage.getItem('ratesLastUpdated')
        }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expense-tracker-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Import data
function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = event => {
            try {
                const data = JSON.parse(event.target.result);
                
                if (data.transactions) {
                    localStorage.setItem('transactions', JSON.stringify(data.transactions));
                }
                
                if (data.settings) {
                    if (data.settings.currency) {
                        localStorage.setItem('selectedCurrency', data.settings.currency);
                    }
                    if (data.settings.displayCurrency) {
                        localStorage.setItem('displayCurrency', data.settings.displayCurrency);
                    }
                    if (data.settings.theme) {
                        localStorage.setItem('theme', data.settings.theme);
                        applyTheme(data.settings.theme);
                    }
                    if (data.settings.exchangeRates) {
                        localStorage.setItem('exchangeRates', data.settings.exchangeRates);
                    }
                    if (data.settings.ratesLastUpdated) {
                        localStorage.setItem('ratesLastUpdated', data.settings.ratesLastUpdated);
                    }
                }
                
                alert('Data imported successfully!');
                location.reload();
            } catch (error) {
                alert('Error importing data: Invalid file format');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// Clear all data
function clearData() {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
        localStorage.clear();
        alert('All data has been cleared.');
        location.reload();
    }
} 