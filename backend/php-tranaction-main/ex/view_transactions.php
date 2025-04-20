<?php
// Database connection parameters
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "expense_tracker";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Fetch income transactions
$income_sql = "SELECT * FROM transactions WHERE transaction_type = 'income' ORDER BY date DESC";
$income_result = $conn->query($income_sql);

// Fetch expense transactions
$expense_sql = "SELECT * FROM transactions WHERE transaction_type = 'expense' ORDER BY date DESC";
$expense_result = $conn->query($expense_sql);

// Calculate totals
$total_income = 0;
$total_expense = 0;

if ($income_result->num_rows > 0) {
    while($row = $income_result->fetch_assoc()) {
        $total_income += $row['amount'];
    }
    $income_result->data_seek(0); // Reset pointer for later use
}

if ($expense_result->num_rows > 0) {
    while($row = $expense_result->fetch_assoc()) {
        $total_expense += $row['amount'];
    }
    $expense_result->data_seek(0); // Reset pointer for later use
}

$net_balance = $total_income - $total_expense;
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>View Transactions</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
        }
        .container {
            display: flex;
            gap: 20px;
            margin-top: 20px;
        }
        .section {
            flex: 1;
            background-color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        h2 {
            color: #2c3e50;
            text-align: center;
            margin-bottom: 20px;
        }
        .income-header {
            color: #2ecc71;
        }
        .expense-header {
            color: #e74c3c;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #f8f9fa;
            font-weight: 600;
        }
        .amount {
            text-align: right;
        }
        .income-amount {
            color: #2ecc71;
        }
        .expense-amount {
            color: #e74c3c;
        }
        .back-link {
            display: inline-block;
            margin-bottom: 20px;
            text-decoration: none;
            color: #3498db;
            font-weight: 500;
        }
        .back-link:hover {
            text-decoration: underline;
        }
        .summary-section {
            background-color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            margin-top: 20px;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            text-align: center;
        }
        .summary-item {
            padding: 15px;
            border-radius: 8px;
        }
        .total-income {
            background-color: rgba(46, 204, 113, 0.1);
            color: #2ecc71;
        }
        .total-expense {
            background-color: rgba(231, 76, 60, 0.1);
            color: #e74c3c;
        }
        .net-balance {
            background-color: rgba(52, 152, 219, 0.1);
            color: #3498db;
        }
        .summary-value {
            font-size: 24px;
            font-weight: bold;
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <a href="transaction_form.php" class="back-link">← Back to Add Transaction</a>
    
    <div class="container">
        <div class="section">
            <h2 class="income-header">Income Transactions</h2>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Category</th>
                        <th class="amount">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <?php
                    if ($income_result->num_rows > 0) {
                        while($row = $income_result->fetch_assoc()) {
                            echo "<tr>";
                            echo "<td>" . date('Y-m-d', strtotime($row['date'])) . "</td>";
                            echo "<td>" . htmlspecialchars($row['description']) . "</td>";
                            echo "<td>" . htmlspecialchars($row['category']) . "</td>";
                            echo "<td class='amount income-amount'>+" . number_format($row['amount'], 2) . "</td>";
                            echo "</tr>";
                        }
                    } else {
                        echo "<tr><td colspan='4' style='text-align: center;'>No income transactions found</td></tr>";
                    }
                    ?>
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2 class="expense-header">Expense Transactions</h2>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Category</th>
                        <th class="amount">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <?php
                    if ($expense_result->num_rows > 0) {
                        while($row = $expense_result->fetch_assoc()) {
                            echo "<tr>";
                            echo "<td>" . date('Y-m-d', strtotime($row['date'])) . "</td>";
                            echo "<td>" . htmlspecialchars($row['description']) . "</td>";
                            echo "<td>" . htmlspecialchars($row['category']) . "</td>";
                            echo "<td class='amount expense-amount'>-" . number_format($row['amount'], 2) . "</td>";
                            echo "</tr>";
                        }
                    } else {
                        echo "<tr><td colspan='4' style='text-align: center;'>No expense transactions found</td></tr>";
                    }
                    ?>
                </tbody>
            </table>
        </div>
    </div>

    <div class="summary-section">
        <div class="summary-grid">
            <div class="summary-item total-income">
                <div>Total Income</div>
                <div class="summary-value">+<?php echo number_format($total_income, 2); ?></div>
            </div>
            <div class="summary-item total-expense">
                <div>Total Expense</div>
                <div class="summary-value">-<?php echo number_format($total_expense, 2); ?></div>
            </div>
            <div class="summary-item net-balance">
                <div>Net Balance</div>
                <div class="summary-value"><?php echo number_format($net_balance, 2); ?></div>
            </div>
        </div>
    </div>

    <?php
    $conn->close();
    ?>
</body>
</html> 