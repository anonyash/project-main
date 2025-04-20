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

// DOM Elements
const amountInput = document.getElementById('amount');
const fromCurrency = document.getElementById('from-currency');
const toCurrency = document.getElementById('to-currency');
const resultInput = document.getElementById('result');
const swapBtn = document.getElementById('swap-btn');
const statusDiv = document.getElementById('status');
const fetchRatesBtn = document.getElementById('fetch-rates-btn');
const lastFetchDiv = document.getElementById('last-fetch');

// Use fallback rates as the default saved rates
let savedRates = fallbackRates;
let lastFetchTime = null;

// Format date and time

function formatDateTime(timestamp) {
    if (!timestamp) return '2 April, 2025';
    
    const date = new Date(timestamp);
    return date.toLocaleString();
}

// Update last fetch time display
function updateLastFetchTime() {
    lastFetchDiv.textContent = `Last updated: ${formatDateTime(lastFetchTime)}`;
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

// Function to fetch exchange rates from API
async function fetchExchangeRates() {
    try {
        const updateBtn = document.getElementById('update-rates-btn');
        updateBtn.disabled = true;
        updateBtn.textContent = 'Updating...';
        
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
        // Use fallback rates if API fails
        window.exchangeRates = fallbackRates;
        saveRates(fallbackRates);
        
        const updateBtn = document.getElementById('update-rates-btn');
        updateBtn.textContent = 'Update Failed';
        setTimeout(() => {
            updateBtn.textContent = 'Update Exchange Rates';
            updateBtn.disabled = false;
        }, 2000);
        
        return false;
    }
}

// Function to convert amount between currencies
function convertCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) return amount;
    if (!window.exchangeRates) return amount;

    // Convert to USD first (base currency)
    const usdAmount = fromCurrency === 'USD' ? amount : amount / window.exchangeRates[fromCurrency];
    // Then convert to target currency
    return toCurrency === 'USD' ? usdAmount : usdAmount * window.exchangeRates[toCurrency];
}

// Update the conversion result
function updateConversion() {
    const amount = parseFloat(amountInput.value) || 0;
    const from = fromCurrency.value;
    const to = toCurrency.value;
    
    const result = convertCurrency(amount, from, to);
    resultInput.value = result.toFixed(2);
}

// Update status message
function updateStatus(message) {
    statusDiv.textContent = message;
}

// Initialize the converter
function initializeConverter() {
    // Set up event listeners for real-time updates
    amountInput.addEventListener('input', updateConversion);
    fromCurrency.addEventListener('change', updateConversion);
    toCurrency.addEventListener('change', updateConversion);
    
    // Add input event listeners for currency selects to update on typing
    fromCurrency.addEventListener('input', updateConversion);
    toCurrency.addEventListener('input', updateConversion);
    
    // Add event listener for fetch rates button
    fetchRatesBtn.addEventListener('click', async () => {
        await fetchExchangeRates();
        updateConversion();
    });
    
    swapBtn.addEventListener('click', () => {
        const temp = fromCurrency.value;
        fromCurrency.value = toCurrency.value;
        toCurrency.value = temp;
        updateConversion();
    });
    
    // Initial conversion
    updateConversion();
    updateLastFetchTime();
}

// Initialize exchange rates
document.addEventListener('DOMContentLoaded', async () => {
    // Try to load stored rates first
    const storedRates = loadRates();
    
    if (storedRates) {
        window.exchangeRates = storedRates.rates;
        const lastUpdated = new Date(storedRates.lastUpdated);
        const updateBtn = document.getElementById('update-rates-btn');
        updateBtn.title = `Last updated: ${lastUpdated.toLocaleString()}`;
    } else {
        // If no stored rates, use fallback
        window.exchangeRates = fallbackRates;
        saveRates(fallbackRates);
    }
    
    // Add click handler for update button
    const updateBtn = document.getElementById('update-rates-btn');
    updateBtn.addEventListener('click', fetchExchangeRates);
});

// Start the converter
initializeConverter(); 