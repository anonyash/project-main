<?php
session_start();
require_once 'config.php';

$error = '';
$success = '';

if (!isset($_SESSION['reset_email']) || !isset($_SESSION['reset_otp'])) {
    header("Location: forgot_password.php");
    exit();
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    if (isset($_POST['otp']) && isset($_POST['new_password']) && isset($_POST['confirm_password'])) {
        $otp = trim($_POST['otp']);
        $new_password = $_POST['new_password'];
        $confirm_password = $_POST['confirm_password'];
        
        if ($otp == $_SESSION['reset_otp']) {
            if ($new_password === $confirm_password) {
                if (strlen($new_password) >= 8) {
                    // Hash the new password
                    $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);
                    
                    // Update password in database
                    $stmt = $pdo->prepare("UPDATE form SET password = :password WHERE email = :email");
                    $stmt->bindParam(':password', $hashed_password);
                    $stmt->bindParam(':email', $_SESSION['reset_email']);
                    
                    if ($stmt->execute()) {
                        // Clear session variables
                        unset($_SESSION['reset_otp']);
                        unset($_SESSION['reset_email']);
                        
                        $success = "Password has been reset successfully. You can now login with your new password.";
                    } else {
                        $error = "Failed to update password. Please try again.";
                    }
                } else {
                    $error = "Password must be at least 8 characters long";
                }
            } else {
                $error = "Passwords do not match";
            }
        } else {
            $error = "Invalid OTP";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password - Expenses Tracker</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <div class="container">
        <div class="form-container">
            <h2>Reset Password</h2>
            <?php if ($error): ?>
                <div class="error-message"><?php echo $error; ?></div>
            <?php endif; ?>
            <?php if ($success): ?>
                <div class="success-message"><?php echo $success; ?></div>
                <p class="form-footer">Go to <a href="login.php">Login</a> page</p>
            <?php else: ?>
                <form method="POST" action="">
                    <div class="form-group">
                        <label for="otp">Enter OTP</label>
                        <input type="text" id="otp" name="otp" required maxlength="6" pattern="[0-9]{6}">
                    </div>
                    <div class="form-group">
                        <label for="new_password">New Password</label>
                        <div class="password-input">
                            <input type="password" id="new_password" name="new_password" required>
                            <span class="password-toggle" onclick="togglePassword('new_password')">
                                <i class="fas fa-eye"></i>
                            </span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="confirm_password">Confirm New Password</label>
                        <div class="password-input">
                            <input type="password" id="confirm_password" name="confirm_password" required>
                            <span class="password-toggle" onclick="togglePassword('confirm_password')">
                                <i class="fas fa-eye"></i>
                            </span>
                        </div>
                    </div>
                    <button type="submit" class="btn">Reset Password</button>
                </form>
            <?php endif; ?>
        </div>
    </div>

    <script>
        function togglePassword(inputId) {
            const passwordInput = document.getElementById(inputId);
            const icon = passwordInput.nextElementSibling.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        }
    </script>
</body>
</html> 