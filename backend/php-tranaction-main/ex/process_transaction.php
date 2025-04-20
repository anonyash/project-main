<?php
// Database connection parameters
$servername = "localhost";
$username = "root";  // Default XAMPP username
$password = "";      // Default XAMPP password
$dbname = "expense_tracker";

// Create connection without selecting database
$conn = new mysqli($servername, $username, $password);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Create database if it doesn't exist
$sql = "CREATE DATABASE IF NOT EXISTS expense_tracker";
if ($conn->query($sql) === TRUE) {
    // Select the database
    $conn->select_db($dbname);
    
    // Create transactions table if it doesn't exist
    $sql = "CREATE TABLE IF NOT EXISTS transactions (
        id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        description VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        date DATE NOT NULL,
        category VARCHAR(50) NOT NULL,
        transaction_type ENUM('income', 'expense') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    
    if ($conn->query($sql) === TRUE) {
        // Check if transaction_type column exists
        $result = $conn->query("SHOW COLUMNS FROM transactions LIKE 'transaction_type'");
        if ($result->num_rows == 0) {
            // Add transaction_type column if it doesn't exist
            $alter_sql = "ALTER TABLE transactions ADD COLUMN transaction_type ENUM('income', 'expense') NOT NULL DEFAULT 'expense'";
            if (!$conn->query($alter_sql)) {
                echo "Error adding transaction_type column: " . $conn->error;
                exit;
            }
        }
        
        // Process form submission
        if ($_SERVER["REQUEST_METHOD"] == "POST") {
            $description = $_POST['description'];
            $amount = $_POST['amount'];
            $date = $_POST['date'];
            $category = $_POST['category'];
            $transaction_type = $_POST['transaction_type'];
            
            // Prepare and bind
            $stmt = $conn->prepare("INSERT INTO transactions (description, amount, date, category, transaction_type) VALUES (?, ?, ?, ?, ?)");
            $stmt->bind_param("sdsss", $description, $amount, $date, $category, $transaction_type);
            
            if ($stmt->execute()) {
                echo "<div style='text-align: center; padding: 20px; background-color: #2ecc71; color: white; border-radius: 5px; margin: 20px;'>
                        Transaction added successfully!
                      </div>";
                echo "<div style='text-align: center;'>
                        <a href='transaction_form.php' style='text-decoration: none; color: #3498db;'>Add another transaction</a>
                      </div>";
            } else {
                echo "<div style='text-align: center; padding: 20px; background-color: #e74c3c; color: white; border-radius: 5px; margin: 20px;'>
                        Error: " . $stmt->error . "
                      </div>";
            }
            
            $stmt->close();
        }
    } else {
        echo "Error creating table: " . $conn->error;
    }
} else {
    echo "Error creating database: " . $conn->error;
}

$conn->close();
?> 