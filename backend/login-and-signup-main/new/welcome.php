<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}

require_once 'config.php';

try {
    $stmt = $pdo->prepare("SELECT full_name, email FROM users WHERE id = :user_id");
    $stmt->bindParam(':user_id', $_SESSION['user_id']);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
} catch(PDOException $e) {
    die("Error: " . $e->getMessage());
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome - Expenses Tracker</title>
    <link rel="stylesheet" href="style.css">
    <style>
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .form-container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .dashboard-links {
            margin-top: 20px;
            display: flex;
            gap: 10px;
        }
        .btn {
            display: inline-block;
            padding: 10px 20px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            transition: background 0.3s;
        }
        .btn:hover {
            background: #764ba2;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="form-container">
            <h2>Welcome to Expenses Tracker</h2>
            <p>Hello, <?php echo htmlspecialchars($user['full_name']); ?>!</p>
            <p>Email: <?php echo htmlspecialchars($user['email']); ?></p>
            <div class="dashboard-links">
                <a href="dashboard.php" class="btn">Go to Dashboard</a>
                <a href="logout.php" class="btn">Logout</a>
            </div>
        </div>
    </div>
</body>
</html> 