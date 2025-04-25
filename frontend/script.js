//1
const balance = document.getElementById(
    "balance"
  );
  const money_plus = document.getElementById(
    "money-plus"
  );
  const money_minus = document.getElementById(
    "money-minus"
  );
  const list = document.getElementById("list");
  const form = document.getElementById("form");
  const text = document.getElementById("text");
  const amount = document.getElementById("amount");
  // const dummyTransactions = [
  //   { id: 1, text: "Flower", amount: -20 },
  //   { id: 2, text: "Salary", amount: 300 },
  //   { id: 3, text: "Book", amount: -10 },
  //   { id: 4, text: "Camera", amount: 150 },
  // ];
  
  // let transactions = dummyTransactions;
  
  //last 
  const localStorageTransactions = JSON.parse(localStorage.getItem('transactions'));
  
  let transactions = localStorage.getItem('transactions') !== null ? localStorageTransactions : [];
  
  //5
  let cur = "₹" //   "$"    "₹"

  // Currency conversion related variables
  let currentCurrency = localStorage.getItem('selectedCurrency') || 'INR';
  let baseCurrency = 'INR'; // The currency in which transactions are stored

  // Global chart variables
  let barChart = null;
  let pieChart = null;
  let labels = [];
  let data = [];
  let color = [];

  // Function to update all displayed amounts
  function updateAllAmounts() {
      console.log("updateAllAmounts called");
      const amounts = transactions.map(transaction => transaction.amount);
      const total = amounts.reduce((acc, item) => (acc += item), 0);
      const income = amounts.filter(item => item > 0).reduce((acc, item) => (acc += item), 0);
      const expense = (amounts.filter(item => item < 0).reduce((acc, item) => (acc += item), 0) * -1);

      console.log("Calculated amounts:", { total, income, expense });

      // Convert amounts to current currency
      const convertedTotal = window.convertCurrency(total, baseCurrency, currentCurrency);
      const convertedIncome = window.convertCurrency(income, baseCurrency, currentCurrency);
      const convertedExpense = window.convertCurrency(expense, baseCurrency, currentCurrency);

      console.log("Converted amounts:", { convertedTotal, convertedIncome, convertedExpense });

      balance.innerText = `${getCurrencySymbol(currentCurrency)}${convertedTotal.toFixed(2)}`;
      money_plus.innerText = `${getCurrencySymbol(currentCurrency)}${convertedIncome.toFixed(2)}`;
      money_minus.innerText = `${getCurrencySymbol(currentCurrency)}${convertedExpense.toFixed(2)}`;

      // Update transaction list
      list.innerHTML = '';
      transactions.forEach(transaction => {
          const convertedAmount = window.convertCurrency(Math.abs(transaction.amount), baseCurrency, currentCurrency);
          const item = document.createElement('li');
          item.classList.add(transaction.amount < 0 ? 'minus' : 'plus');
          item.innerHTML = `
              ${transaction.text} <span>${transaction.amount < 0 ? '-' : '+'}${convertedAmount.toFixed(2)}</span>
              <button class="delete-btn" onclick="removeTransaction(${transaction.id})">x</button>
          `;
          list.appendChild(item);
      });
      console.log("updateAllAmounts completed");
  }

  // Function to get currency symbol
  function getCurrencySymbol(currency) {
      console.log("getCurrencySymbol called with:", currency);
      const symbols = {
          'INR': '₹',
          'USD': '$',
          'EUR': '€',
          'GBP': '£',
          'JPY': '¥',
          'CAD': 'C$',
          'CHF': 'Fr',
          'CNY': '¥'
      };
      const symbol = symbols[currency] || currency;
      console.log("Returning symbol:", symbol);
      return symbol;
  }

  // Function to convert currency
  function convertCurrency(amount, fromCurrency, toCurrency) {
    console.log("convertCurrency called with:", { amount, fromCurrency, toCurrency });
    if (fromCurrency === toCurrency) {
        console.log("Same currency, returning original amount");
        return amount;
    }
    
    // Try to get rates from localStorage first
    const savedRates = JSON.parse(localStorage.getItem('exchangeRates'));
    const rates = savedRates || window.exchangeRates || fallbackRates;
    console.log("Using rates:", rates);
    
    // Convert to USD first (base currency)
    const usdAmount = fromCurrency === 'USD' ? amount : amount / rates[fromCurrency];
    // Then convert to target currency
    const result = toCurrency === 'USD' ? usdAmount : usdAmount * rates[toCurrency];
    console.log("Conversion result:", result);
    return result;
  }
  
  // Initialize currency converter
  document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOMContentLoaded event fired");
    const currencySelect = document.getElementById('currency-select');
    const transactionCurrencySelect = document.getElementById('transaction-currency');
    
    // Set initial currency in dropdowns to INR
    // currencySelect.value = 'INR';
    transactionCurrencySelect.value = 'INR';
    
    
  // init chart
    chartinit()


    


    // Add event listener for currency change
    currencySelect.addEventListener('change', async () => {
        console.log("Currency changed, updating charts...");
        await changeCurrency(currencySelect.value);
        updateChartData();
    });

    // Initialize exchange rates on page load
    const savedRates = JSON.parse(localStorage.getItem('exchangeRates'));
    if (savedRates) {
        console.log("Using saved exchange rates:", savedRates);
        window.exchangeRates = savedRates;
    } else {
        console.log("No saved rates found, attempting to fetch new ones");
        try {
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            if (response.ok) {
                const data = await response.json();
                console.log("Fetched new exchange rates:", data.rates);
                window.exchangeRates = data.rates;
                localStorage.setItem('exchangeRates', JSON.stringify(data.rates));
                localStorage.setItem('ratesLastUpdated', Date.now());
            } else {
                console.log("API fetch failed, using fallback rates");
                window.exchangeRates = fallbackRates;
                localStorage.setItem('exchangeRates', JSON.stringify(fallbackRates));
            }
        } catch (error) {
            console.error('Error fetching exchange rates:', error);
            console.log("Using fallback rates due to error");
            window.exchangeRates = fallbackRates;
            localStorage.setItem('exchangeRates', JSON.stringify(fallbackRates));
        }
    }
    
    // Initial currency setup
    console.log("Performing initial currency setup");
    updateAllAmounts();
    updateChartData();
  });


 
// Function to change currency globally
  async function changeCurrency(newCurrency) {
    console.log("changeCurrency called with:", newCurrency);
    if (newCurrency !== currentCurrency) {
      currentCurrency = newCurrency;
      localStorage.setItem('selectedCurrency', currentCurrency);
      console.log("Currency changed to:", currentCurrency);
      updateAllAmounts();
      updateChartData();
    } else {
      console.log("Currency unchanged");
    }
  }

  //Add Transaction
  function addTransaction(e){
    console.log("addTransaction called");
    e.preventDefault();
    if(text.value.trim() === '' || amount.value.trim() === ''){
      console.log("Validation failed: empty fields");
      alert('please add category and amount')
    }else if(amount.value < 0){ 
      console.log("Validation failed: negative amount");
      alert('please enter a valid amount') 
    }else{
      let togg = document.getElementById('expen');
      let sig = togg.checked? "-" : "+";
      
      // Get the selected transaction currency
      const transactionCurrency = document.getElementById('transaction-currency').value;
      console.log("Transaction currency:", transactionCurrency);
      
      // Convert the input amount from transaction currency to base currency (INR)
      const inputAmount = parseFloat(amount.value);
      const amountInBaseCurrency = window.convertCurrency(inputAmount, transactionCurrency, baseCurrency);
      console.log("Converted amount:", amountInBaseCurrency);
      
      if(sig == "-"){
        const transaction = {
          id:generateID(),
          text:text.value,
          amount: -amountInBaseCurrency,
          sig:"-",
          currency: transactionCurrency
        }
        console.log("Adding expense transaction:", transaction);
        transactions.push(transaction);
        addTransactionDOM(transaction);
      } else {
        const transaction = {
          id:generateID(),
          text:text.value,
          amount: +amountInBaseCurrency,
          sig:"+",
          currency: transactionCurrency
        }
        console.log("Adding income transaction:", transaction);
        transactions.push(transaction);
        addTransactionDOM(transaction);
      }
        
      updateValues();
      updateLocalStorage();
      
      // Update chart data
      updateChartData();
      
      text.value='';
      amount.value='';
      console.log("addTransaction completed");
    }
  }
  
// Function to update chart data
function updateChartData() {
  console.log("updateChartData called");
  console.log("Current transactions:", transactions);
  
  // Clear existing data
  labels.length = 0;
  data.length = 0;

  console.log("Cleared chart data arrays");

  // Group transactions by category and sum amounts
  const categoryTotals = {};
  transactions.forEach(transaction => {
      console.log("Processing transaction:", transaction);
      const convertedAmount = window.convertCurrency(Math.abs(transaction.amount), baseCurrency, currentCurrency);
      console.log("Converted amount:", convertedAmount);
      
      if (!categoryTotals[transaction.text]) {
          categoryTotals[transaction.text] = 0;
      }
      categoryTotals[transaction.text] += convertedAmount;
  });

  console.log("Category totals:", categoryTotals);

  // Add data to chart arrays
  Object.entries(categoryTotals).forEach(([category, total]) => {
      console.log("Adding to chart:", { category, total });
      labels.push(category);
      data.push(total);
      // color.push(backgroundColor);
  });

  console.log("Final chart data:", { labels, data });
  
  // Update charts if they exist
  if (barChart && pieChart) {
      console.log("Updating charts with new data");
      
      try {
          // Update bar chart
          barChart.data.labels = labels;
          barChart.data.datasets[0].data = data;
          barChart.update();
          
          // Update pie chart
          pieChart.data.labels = labels;
          pieChart.data.datasets[0].data = data;
          // pieChart.data.color = color;
          pieChart.update();
          
          console.log("Charts updated successfully");
      } catch (error) {
          console.error("Error updating charts:", error);
      }
  } else {
      console.error("Charts not initialized properly");
  }
  
  console.log("updateChartData completed");
}




  
  //5.5
  //Generate Random ID
  function generateID(){
    console.log("generateID called");
    const id = Math.floor(Math.random()*1000000000);
    console.log("Generated ID:", id);
    return id;
  }
  
  //2
  
  
  function toggl(){
  let togg = document.getElementById('expen');
  console.log(togg.checked);
  }

  let sig2

  function updTransactionDOM(transaction) {
    
    //GET sign
    let sign2 = sig2[0];
    const item = document.createElement("li");
  
    //Add Class Based on Value
    item.classList.add(
      sig2[0] =="-"? "minus" : "plus"
    );
    console.log( item.classList)
    item.innerHTML = `
      ${transaction.text} <span>${sign2}${Math.abs(
      transaction.amount
    )}</span>
      <button class="delete-btn" onclick="removeTransaction(${transaction.id})">x</button>
      `;
    list.appendChild(item);
    sig2.shift();
  }




  
  //##########################_______chart and data visualisation___________#########################
  // const labels = [];
  // const data = [];

  // const barChartCtx = document.getElementById('barChart').getContext('2d');
  // const pieChartCtx = document.getElementById('pieChart').getContext('2d');

  // const barChart = new Chart(barChartCtx, {
  //     type: 'bar',
  //     data: { labels, datasets: [{ label: 'Values', data, backgroundColor: ['red', 'blue', 'green', 'yellow', 'purple'] }] },
  // });

  // const pieChart = new Chart(pieChartCtx, {
  //     type: 'pie',
  //     data: { labels, datasets: [{ data, backgroundColor: ['red', 'blue', 'green', 'yellow', 'purple'] }] },
  // });

  // function addData() {
  //     const label = document.getElementById("text").value;
  //     const value = document.getElementById("amount").value;

  //     if (label && value) {
  //         labels.push(label);
  //         data.push(Number(value));
  //         barChart.update();
  //         pieChart.update();
  //         console.log("chart updated")

  //         // document.getElementById('labelInput').value = '';
  //         // document.getElementById('valueInput').value = '';
  //     }
  // }
















  let togg = document.getElementById('expen');
    let tru = togg.checked
    let sig = tru? "-" : "+";
  //Add Trasactions to DOM list
  function addTransactionDOM(transaction) {
    
    //GET sign
    const sign = sig;
    const item = document.createElement("li");
  
    //Add Class Based on Value
    item.classList.add(
      togg.checked? "minus" : "plus"
    );
  
    // Convert amount to current display currency
    const displayAmount = window.convertCurrency(Math.abs(transaction.amount), baseCurrency, currentCurrency);
  
    item.innerHTML = `
      ${transaction.text} <span>${sign}${getCurrencySymbol(currentCurrency)}${displayAmount}</span>
      <button class="delete-btn" onclick="removeTransaction(${transaction.id})">x</button>
      `;
    list.appendChild(item);
  }
  
  //4
  
  //Update the balance income and expence
  function updateValues() {
    const amounts = transactions.map(
      (transaction) => transaction.amount
    );
    const total = amounts
      .reduce((acc, item) => (acc += item), 0)
      .toFixed(2);
    const income = amounts
      .filter((item) => item > 0)
      .reduce((acc, item) => (acc += item), 0)
      .toFixed(2);
    const expense =
      (amounts
        .filter((item) => item < 0)
        .reduce((acc, item) => (acc += item), 0) *
      -1).toFixed(2);
    sig2 = transactions.map(
        (transaction) => transaction.sig
    );
      chartinit()
      updateChartData()
      console.log(sig2)
      console.log(expense)
      balance.innerText=`${getCurrencySymbol(currentCurrency)}${convertCurrency(total, baseCurrency, currentCurrency)}`;
      money_plus.innerText = `${getCurrencySymbol(currentCurrency)}${convertCurrency(income, baseCurrency, currentCurrency)}`;
      money_minus.innerText = `${getCurrencySymbol(currentCurrency)}${convertCurrency(expense, baseCurrency, currentCurrency)}`;
  }
  
  
  //6 
  
  //Remove Transaction by ID
  function removeTransaction(id){
    console.log("removeTransaction called with ID:", id);
    transactions = transactions.filter(transaction => transaction.id !== id);
    console.log("Remaining transactions:", transactions);
    updateLocalStorage();
    Init();
    console.log("removeTransaction completed");
  }
  //last
  //update Local Storage Transaction
  function updateLocalStorage(){
    console.log("updateLocalStorage called");
    localStorage.setItem('transactions',JSON.stringify(transactions));
    console.log("Transactions saved to localStorage");
  }
  


// Initialize charts
function chartinit(){
  console.log("Initializing charts...");
  let sign3 = sig[0] == "+"? 1 : 0 ;  
  // Initialize chart data arrays
  labels = [];
  data = [];
  console.log("Initial chart data arrays:", { labels, data });
 
  const barChartCtx = document.getElementById('barChart');
  const pieChartCtx = document.getElementById('pieChart');
  
  if (!barChartCtx || !pieChartCtx) {
      console.error("Chart canvas elements not found!");
      return;
  }
  
  console.log("Chart contexts found:", { barChartCtx, pieChartCtx });
 
  try {
      // Initialize bar chart
      barChart = new Chart(barChartCtx.getContext('2d'), {
          type: 'bar',
          data: { 
              labels: labels, 
              datasets: [{ 
                  label: 'Values', 
                  data: data, 
                  backgroundColor:  ['rgb(32, 198, 96)','rgb(89, 53, 219)','rgb(198, 93, 32)','rgb(179, 198, 32)','rgb(198, 32, 123)' ]   //add shades of green and blue
              }] 
          },
          options: {
              responsive: true,
              scales: {
                  y: {
                      beginAtZero: true
                  }
              }
          }
      });
      console.log("Bar chart initialized:", barChart);
 
      // Initialize pie chart
      pieChart = new Chart(pieChartCtx.getContext('2d'), {
          type: 'pie',
          data: { 
              labels: labels, 
              datasets: [{ 
                  data: data, 
                  
                  backgroundColor:  ['rgb(32, 198, 96)','rgb(89, 53, 219)','rgb(198, 93, 32)','rgb(179, 198, 32)','rgb(198, 32, 123)' ]  //add shades of green and blue
              }]
          },
          options: {
              responsive: true
          }
      });
      console.log("Pie chart initialized:", pieChart);
  } catch (error) {
      console.error("Error initializing charts:", error);
  }
 
 
 
   }
 
  //3
  
  //Init App
  function Init() {
    console.log("Init called");
    list.innerHTML = "";
    updateValues();
    transactions.forEach(updTransactionDOM);
  }

  Init();
  
  form.addEventListener('submit',addTransaction);