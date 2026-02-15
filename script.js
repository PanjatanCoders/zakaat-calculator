// Global State
let currentCurrency = 'INR';
let currencySymbol = '\u20B9';
const NISAB_SILVER_GRAMS = 612.36;
const ZAKAT_PERCENTAGE = 0.025;

let zakatData = {
    totalZakat: 0,
    netWealth: 0,
    payments: [],
    calculations: []
};

// Form data to persist across refreshes
let formData = {
    currency: 'INR',
    currencySymbol: '\u20B9',
    silverPrice: 90,
    goldRate: 0,
    assets: {},   // keyed by container id, array of {description, value}
    metals: {},   // keyed by container id, array of {description, grams}
    debts: []     // array of {description, value}
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadFromStorage();
    loadFormData();
    document.getElementById('paymentDate').valueAsDate = new Date();
});

// Load data from localStorage
function loadFromStorage() {
    const saved = localStorage.getItem('zakatData');
    if (saved) {
        zakatData = JSON.parse(saved);
    }
}

// Save data to localStorage
function saveToStorage() {
    localStorage.setItem('zakatData', JSON.stringify(zakatData));
}

// Save form data to localStorage
function saveFormData() {
    // Collect all asset fields
    formData.currency = currentCurrency;
    formData.currencySymbol = currencySymbol;
    formData.silverPrice = parseFloat(document.getElementById('silverPrice').value) || 0;
    formData.goldRate = parseFloat(document.getElementById('goldRate').value) || 0;

    // Collect regular asset containers
    const assetContainers = ['cash-container', 'investments-container', 'business-container', 'property-container', 'receivables-container', 'other-container'];
    formData.assets = {};
    assetContainers.forEach(containerId => {
        const items = [];
        document.querySelectorAll(`#${containerId} .asset-item`).forEach(item => {
            const desc = item.querySelector('input[type="text"]')?.value || '';
            const val = item.querySelector('.asset-value')?.value || '';
            items.push({ description: desc, value: val });
        });
        formData.assets[containerId] = items;
    });

    // Collect metal containers (gold/silver in grams)
    const metalContainers = ['gold-container', 'silver-container'];
    formData.metals = {};
    metalContainers.forEach(containerId => {
        const items = [];
        document.querySelectorAll(`#${containerId} .metal-item`).forEach(item => {
            const desc = item.querySelector('input[type="text"]')?.value || '';
            const grams = item.querySelector('.metal-grams')?.value || '';
            items.push({ description: desc, grams: grams });
        });
        formData.metals[containerId] = items;
    });

    // Collect debts
    formData.debts = [];
    document.querySelectorAll('#debts-container .asset-item').forEach(item => {
        const desc = item.querySelector('input[type="text"]')?.value || '';
        const val = item.querySelector('.debt-value')?.value || '';
        formData.debts.push({ description: desc, value: val });
    });

    localStorage.setItem('zakatFormData', JSON.stringify(formData));
}

// Load form data from localStorage and rebuild the form
function loadFormData() {
    const saved = localStorage.getItem('zakatFormData');
    if (saved) {
        formData = JSON.parse(saved);

        // Restore currency
        currentCurrency = formData.currency || 'INR';
        currencySymbol = formData.currencySymbol || '\u20B9';
        document.querySelectorAll('.currency-symbol').forEach(el => {
            el.textContent = currencySymbol;
        });
        document.querySelectorAll('.currency-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent.includes(currentCurrency)) {
                btn.classList.add('active');
            }
        });

        // Restore rates
        document.getElementById('silverPrice').value = formData.silverPrice || 90;
        document.getElementById('goldRate').value = formData.goldRate || 0;

        // Restore regular assets
        const assetContainers = ['cash-container', 'investments-container', 'business-container', 'property-container', 'receivables-container', 'other-container'];
        assetContainers.forEach(containerId => {
            const items = formData.assets[containerId];
            if (items && items.length > 0) {
                items.forEach(item => {
                    addAssetField(containerId, item.description, item.value);
                });
            } else {
                addAssetField(containerId);
            }
        });

        // Restore metal fields
        const metalContainers = { 'gold-container': 'gold', 'silver-container': 'silver' };
        Object.entries(metalContainers).forEach(([containerId, metalType]) => {
            const items = formData.metals[containerId];
            if (items && items.length > 0) {
                items.forEach(item => {
                    addMetalField(containerId, metalType, item.description, item.grams);
                });
            } else {
                addMetalField(containerId, metalType);
            }
        });

        // Restore debts
        if (formData.debts && formData.debts.length > 0) {
            formData.debts.forEach(item => {
                addDebtField('debts-container', item.description, item.value);
            });
        } else {
            addDebtField('debts-container');
        }
    } else {
        // First time — initialize with empty fields
        initializeAssetFields();
    }

    calculateZakat();
    updateDashboard();
}

// Initialize asset fields (first time only)
function initializeAssetFields() {
    const regularContainers = ['cash', 'investments', 'business', 'property', 'receivables', 'other'];
    regularContainers.forEach(container => {
        addAssetField(container + '-container');
    });

    addMetalField('gold-container', 'gold');
    addMetalField('silver-container', 'silver');
    addDebtField('debts-container');
}

// Switch tabs
function switchTab(tabName) {
    document.querySelectorAll('.nav-tab').forEach(btn => btn.classList.remove('active'));
    event.target.closest('.nav-tab').classList.add('active');

    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');

    if (tabName === 'dashboard') {
        updateDashboard();
    } else if (tabName === 'payments') {
        displayAllPayments();
    } else if (tabName === 'history') {
        displayCalculationHistory();
    }
}

// Currency selection
function setCurrency(currency, symbol) {
    currentCurrency = currency;
    currencySymbol = symbol;

    document.querySelectorAll('.currency-symbol').forEach(el => {
        el.textContent = symbol;
    });

    document.querySelectorAll('.currency-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    calculateZakat();
    updateDashboard();
    saveFormData();
}

// Add asset field (regular currency-value field)
function addAssetField(containerId, desc, val) {
    const container = document.getElementById(containerId);
    const item = document.createElement('div');
    item.className = 'asset-item';
    item.innerHTML = `
        <input type="text" class="input-field" placeholder="Description" value="${desc || ''}" oninput="onFormChange()">
        <div class="input-with-icon" style="width: 200px;">
            <span class="input-icon currency-symbol">${currencySymbol}</span>
            <input type="number" class="input-field asset-value" step="0.01" placeholder="0.00" value="${val || ''}" oninput="onFormChange(); calculateZakat();">
        </div>
        <button class="btn-icon delete" onclick="this.parentElement.remove(); onFormChange(); calculateZakat();">
            <span class="material-icons">delete</span>
        </button>
    `;
    container.appendChild(item);
}

// Add metal field (grams-based for gold/silver)
function addMetalField(containerId, metalType, desc, grams) {
    const container = document.getElementById(containerId);
    const item = document.createElement('div');
    item.className = 'asset-item metal-item';
    item.setAttribute('data-metal', metalType);
    item.innerHTML = `
        <input type="text" class="input-field" placeholder="e.g. Necklace, Ring, Coins" value="${desc || ''}" oninput="onFormChange()">
        <div class="input-with-icon" style="width: 200px;">
            <span class="input-icon" style="font-size: 0.8rem; color: var(--text-secondary);">gm</span>
            <input type="number" class="input-field metal-grams" step="0.01" placeholder="0.00" value="${grams || ''}" oninput="onFormChange(); calculateZakat();">
        </div>
        <button class="btn-icon delete" onclick="this.parentElement.remove(); onFormChange(); calculateZakat();">
            <span class="material-icons">delete</span>
        </button>
    `;
    container.appendChild(item);
}

// Add debt field
function addDebtField(containerId, desc, val) {
    const container = document.getElementById(containerId);
    const item = document.createElement('div');
    item.className = 'asset-item';
    item.innerHTML = `
        <input type="text" class="input-field" placeholder="Description" value="${desc || ''}" oninput="onFormChange()">
        <div class="input-with-icon" style="width: 200px;">
            <span class="input-icon currency-symbol">${currencySymbol}</span>
            <input type="number" class="input-field debt-value" step="0.01" placeholder="0.00" value="${val || ''}" oninput="onFormChange(); calculateZakat();">
        </div>
        <button class="btn-icon delete" onclick="this.parentElement.remove(); onFormChange(); calculateZakat();">
            <span class="material-icons">delete</span>
        </button>
    `;
    container.appendChild(item);
}

// Called on any form input change to persist data
function onFormChange() {
    saveFormData();
}

// Calculate Zakat
function calculateZakat() {
    const silverPrice = parseFloat(document.getElementById('silverPrice').value) || 0;
    const goldRate = parseFloat(document.getElementById('goldRate').value) || 0;
    const nisabThreshold = silverPrice * NISAB_SILVER_GRAMS;

    // Calculate gold value from grams
    let totalGoldGrams = 0;
    document.querySelectorAll('#gold-container .metal-grams').forEach(input => {
        totalGoldGrams += parseFloat(input.value) || 0;
    });
    const goldValue = totalGoldGrams * goldRate;

    // Calculate silver value from grams
    let totalSilverGrams = 0;
    document.querySelectorAll('#silver-container .metal-grams').forEach(input => {
        totalSilverGrams += parseFloat(input.value) || 0;
    });
    const silverValue = totalSilverGrams * silverPrice;

    // Update metal total displays
    document.getElementById('goldTotalValue').textContent = formatCurrency(goldValue);
    document.getElementById('silverTotalValue').textContent = formatCurrency(silverValue);

    // Calculate regular asset values
    let totalRegularAssets = 0;
    document.querySelectorAll('.asset-value').forEach(input => {
        totalRegularAssets += parseFloat(input.value) || 0;
    });

    const totalAssets = totalRegularAssets + goldValue + silverValue;

    let totalDebts = 0;
    document.querySelectorAll('.debt-value').forEach(input => {
        totalDebts += parseFloat(input.value) || 0;
    });

    const netWealth = totalAssets - totalDebts;
    const zakatAmount = netWealth * ZAKAT_PERCENTAGE;

    // Update UI
    document.getElementById('nisabThreshold').textContent = formatCurrency(nisabThreshold);
    document.getElementById('totalAssets').textContent = formatCurrency(totalAssets);
    document.getElementById('totalDebts').textContent = formatCurrency(totalDebts);
    document.getElementById('netWealth').textContent = formatCurrency(netWealth);

    if (netWealth >= nisabThreshold && nisabThreshold > 0) {
        document.getElementById('nisabStatus').innerHTML = `
            <span class="nisab-badge eligible">
                <span class="material-icons" style="font-size: 1rem;">check_circle</span>
                Zakat Obligatory
            </span>
        `;
        document.getElementById('zakatAmount').textContent = formatCurrency(zakatAmount);
        document.getElementById('zakatDueSection').style.display = 'block';
        document.getElementById('noZakatSection').style.display = 'none';

        zakatData.totalZakat = zakatAmount;
        zakatData.netWealth = netWealth;
        saveToStorage();
    } else {
        document.getElementById('nisabStatus').innerHTML = `
            <span class="nisab-badge not-eligible">
                <span class="material-icons" style="font-size: 1rem;">cancel</span>
                Below Nisab
            </span>
        `;
        document.getElementById('zakatDueSection').style.display = 'none';
        document.getElementById('noZakatSection').style.display = 'block';

        zakatData.totalZakat = 0;
        zakatData.netWealth = netWealth;
        saveToStorage();
    }

    saveFormData();
}

// Format currency
function formatCurrency(amount) {
    return currencySymbol + ' ' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Save calculation
function saveCalculation() {
    const calculation = {
        timestamp: new Date().toISOString(),
        currency: currentCurrency,
        currencySymbol: currencySymbol,
        silverPrice: document.getElementById('silverPrice').value,
        goldRate: document.getElementById('goldRate').value,
        totalZakat: zakatData.totalZakat,
        netWealth: zakatData.netWealth,
        assets: [],
        debts: []
    };

    // Collect regular assets
    const regularContainers = ['cash-container', 'investments-container', 'business-container', 'property-container', 'receivables-container', 'other-container'];
    regularContainers.forEach(containerId => {
        document.querySelectorAll(`#${containerId} .asset-item`).forEach(item => {
            const desc = item.querySelector('input[type="text"]')?.value;
            const value = item.querySelector('.asset-value')?.value;
            if (desc || value) {
                calculation.assets.push({ description: desc, value: value });
            }
        });
    });

    // Collect metal assets with calculated values
    const goldRate = parseFloat(document.getElementById('goldRate').value) || 0;
    const silverPrice = parseFloat(document.getElementById('silverPrice').value) || 0;
    document.querySelectorAll('#gold-container .metal-item').forEach(item => {
        const desc = item.querySelector('input[type="text"]')?.value;
        const grams = parseFloat(item.querySelector('.metal-grams')?.value) || 0;
        if (desc || grams) {
            calculation.assets.push({ description: `Gold: ${desc} (${grams}g)`, value: (grams * goldRate).toFixed(2) });
        }
    });
    document.querySelectorAll('#silver-container .metal-item').forEach(item => {
        const desc = item.querySelector('input[type="text"]')?.value;
        const grams = parseFloat(item.querySelector('.metal-grams')?.value) || 0;
        if (desc || grams) {
            calculation.assets.push({ description: `Silver: ${desc} (${grams}g)`, value: (grams * silverPrice).toFixed(2) });
        }
    });

    // Collect debts
    document.querySelectorAll('#debts-container .asset-item').forEach(item => {
        const desc = item.querySelector('input[type="text"]')?.value;
        const value = item.querySelector('.debt-value')?.value;
        if (desc || value) {
            calculation.debts.push({ description: desc, value: value });
        }
    });

    zakatData.calculations.unshift(calculation);
    zakatData.calculations = zakatData.calculations.slice(0, 20);
    saveToStorage();

    alert('✓ Calculation saved successfully!');
}

// Reset calculation
function resetCalculation() {
    if (!confirm('Are you sure you want to reset all values?')) return;

    document.querySelectorAll('.asset-value, .debt-value, .metal-grams').forEach(input => {
        input.value = '';
    });

    document.querySelectorAll('input[type="text"]').forEach(input => {
        if (!input.id) input.value = '';
    });

    calculateZakat();
    saveFormData();
}

// Payment Modal
function openPaymentModal() {
    document.getElementById('paymentModal').classList.add('active');
    document.getElementById('paymentAmount').value = '';
    document.getElementById('paymentNote').value = '';
}

function closePaymentModal() {
    document.getElementById('paymentModal').classList.remove('active');
}

// Record payment
function recordPayment() {
    const amount = parseFloat(document.getElementById('paymentAmount').value);
    const date = document.getElementById('paymentDate').value;
    const note = document.getElementById('paymentNote').value;

    if (!amount || amount <= 0) {
        alert('Please enter a valid payment amount');
        return;
    }

    if (!date) {
        alert('Please select a payment date');
        return;
    }

    const payment = {
        id: Date.now(),
        amount: amount,
        date: date,
        note: note,
        currency: currentCurrency,
        currencySymbol: currencySymbol
    };

    zakatData.payments.unshift(payment);
    saveToStorage();

    closePaymentModal();
    updateDashboard();
    alert('✓ Payment recorded successfully!');
}

// Update dashboard
function updateDashboard() {
    const totalPaid = zakatData.payments.reduce((sum, p) => sum + p.amount, 0);
    const remaining = Math.max(0, zakatData.totalZakat - totalPaid);
    const progress = zakatData.totalZakat > 0 ? (totalPaid / zakatData.totalZakat * 100) : 0;

    document.getElementById('dashTotalZakat').textContent = formatCurrency(zakatData.totalZakat);
    document.getElementById('dashTotalPaid').textContent = formatCurrency(totalPaid);
    document.getElementById('dashRemaining').textContent = formatCurrency(remaining);
    document.getElementById('dashNetWealth').textContent = formatCurrency(zakatData.netWealth);
    document.getElementById('dashPaymentCount').textContent = `${zakatData.payments.length} payment${zakatData.payments.length !== 1 ? 's' : ''} made`;

    document.getElementById('progressFill').style.width = Math.min(progress, 100) + '%';
    document.getElementById('progressPercent').textContent = Math.round(progress) + '%';
    document.getElementById('progressAmount').textContent = `${formatCurrency(totalPaid)} / ${formatCurrency(zakatData.totalZakat)}`;

    displayRecentPayments();
}

// Display recent payments
function displayRecentPayments() {
    const container = document.getElementById('recentPaymentsList');
    const recent = zakatData.payments.slice(0, 5);

    if (recent.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <span class="material-icons">receipt_long</span>
                </div>
                <div>No payments recorded yet</div>
            </div>
        `;
        return;
    }

    container.innerHTML = recent.map(payment => `
        <div class="payment-item">
            <div class="payment-info">
                <div class="payment-amount">${payment.currencySymbol} ${payment.amount.toFixed(2)}</div>
                <div class="payment-date">${new Date(payment.date).toLocaleDateString()}</div>
                ${payment.note ? `<div class="payment-note">${payment.note}</div>` : ''}
            </div>
            <button class="btn-icon delete" onclick="deletePayment(${payment.id})">
                <span class="material-icons">delete</span>
            </button>
        </div>
    `).join('');
}

// Display all payments
function displayAllPayments() {
    const container = document.getElementById('allPaymentsList');

    if (zakatData.payments.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <span class="material-icons">receipt_long</span>
                </div>
                <div>No payments recorded yet</div>
                <button class="btn btn-success" onclick="openPaymentModal()" style="margin-top: 1rem;">
                    <span class="material-icons">add</span>
                    Add First Payment
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = zakatData.payments.map(payment => `
        <div class="payment-item">
            <div class="payment-info">
                <div class="payment-amount">${payment.currencySymbol} ${payment.amount.toFixed(2)}</div>
                <div class="payment-date">${new Date(payment.date).toLocaleDateString()}</div>
                ${payment.note ? `<div class="payment-note">${payment.note}</div>` : ''}
            </div>
            <button class="btn-icon delete" onclick="deletePayment(${payment.id})">
                <span class="material-icons">delete</span>
            </button>
        </div>
    `).join('');
}

// Delete payment
function deletePayment(id) {
    if (!confirm('Are you sure you want to delete this payment?')) return;

    zakatData.payments = zakatData.payments.filter(p => p.id !== id);
    saveToStorage();
    updateDashboard();
    displayAllPayments();
}

// Display calculation history
function displayCalculationHistory() {
    const container = document.getElementById('calculationHistory');

    if (zakatData.calculations.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <span class="material-icons">history</span>
                </div>
                <div>No saved calculations yet</div>
            </div>
        `;
        return;
    }

    container.innerHTML = zakatData.calculations.map((calc, index) => {
        const date = new Date(calc.timestamp);
        return `
            <div class="payment-item">
                <div class="payment-info">
                    <div class="payment-amount">${calc.currencySymbol} ${calc.totalZakat.toFixed(2)}</div>
                    <div class="payment-date">${date.toLocaleDateString()} ${date.toLocaleTimeString()}</div>
                    <div class="payment-note">${calc.currency} - Net Wealth: ${calc.currencySymbol} ${calc.netWealth.toFixed(2)}</div>
                </div>
                <button class="btn-icon delete" onclick="deleteCalculation(${index})">
                    <span class="material-icons">delete</span>
                </button>
            </div>
        `;
    }).join('');
}

// Delete calculation
function deleteCalculation(index) {
    if (!confirm('Are you sure you want to delete this calculation?')) return;

    zakatData.calculations.splice(index, 1);
    saveToStorage();
    displayCalculationHistory();
}

// Close modal on outside click
document.getElementById('paymentModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closePaymentModal();
    }
});
