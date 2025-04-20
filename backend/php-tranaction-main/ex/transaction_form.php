<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Expense Tracker</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
        }
        .container {
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        h2 {
            color: #2c3e50;
            text-align: center;
            margin-bottom: 30px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 8px;
            color: #2c3e50;
            font-weight: 500;
        }
        input, select {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 16px;
            transition: border-color 0.3s;
        }
        input:focus, select:focus {
            border-color: #3498db;
            outline: none;
        }
        .button-group {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
        }
        .btn {
            flex: 1;
            padding: 12px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            transition: background-color 0.3s;
        }
        .btn-income {
            background-color: #2ecc71;
            color: white;
        }
        .btn-income:hover {
            background-color: #27ae60;
        }
        .btn-expense {
            background-color: #e74c3c;
            color: white;
        }
        .btn-expense:hover {
            background-color: #c0392b;
        }
        .btn-submit {
            background-color: #3498db;
            color: white;
            width: 100%;
            padding: 12px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            transition: background-color 0.3s;
        }
        .btn-submit:hover {
            background-color: #2980b9;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Expense Tracker</h2>
        <form action="process_transaction.php" method="POST">
            <div class="button-group">
                <button type="button" class="btn btn-income" onclick="setTransactionType('income')">Add Income</button>
                <button type="button" class="btn btn-expense" onclick="setTransactionType('expense')">Add Expense</button>
            </div>

            <div class="form-group">
                <label for="description">Transaction Description:</label>
                <input type="text" id="description" name="description" required>
            </div>

            <div class="form-group">
                <label for="amount">Amount:</label>
                <input type="number" id="amount" name="amount" step="0.01" required>
            </div>

            <div class="form-group">
                <label for="date">Date:</label>
                <input type="date" id="date" name="date" required>
            </div>

            <div class="form-group">
                <label for="category">Category:</label>
                <select id="category" name="category" required>
                    <option value="">Select a category</option>
                    <optgroup label="Daily Expenses">
                        <option value="Food">Food & Dining</option>
                        <option value="Transportation">Transportation</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Utilities">Utilities</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Education">Education</option>
                    </optgroup>
                    <optgroup label="Business">
                        <option value="Salary">Salary</option>
                        <option value="Office Supplies">Office Supplies</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Travel">Business Travel</option>
                        <option value="Equipment">Equipment</option>
                    </optgroup>
                    <optgroup label="Assets & Liabilities">
                        <option value="Assets">Assets Purchase</option>
                        <option value="Liabilities">Liabilities</option>
                        <option value="Investments">Investments</option>
                        <option value="Savings">Savings</option>
                    </optgroup>
                    <optgroup label="Loans">
                        <option value="Personal Loan">Personal Loan</option>
                        <option value="Business Loan">Business Loan</option>
                        <option value="Home Loan">Home Loan</option>
                        <option value="Car Loan">Car Loan</option>
                    </optgroup>
                </select>
            </div>

            <input type="hidden" id="transaction_type" name="transaction_type" value="expense">
            <button type="submit" class="btn-submit">Add Transaction</button>
        </form>
    </div>

    <script>
        function setTransactionType(type) {
            document.getElementById('transaction_type').value = type;
            const buttons = document.querySelectorAll('.btn');
            buttons.forEach(btn => {
                btn.style.opacity = '0.7';
            });
            if (type === 'income') {
                document.querySelector('.btn-income').style.opacity = '1';
            } else {
                document.querySelector('.btn-expense').style.opacity = '1';
            }
        }
    </script>
</body>
</html> 