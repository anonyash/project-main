<?php
session_start();
require_once 'config.php';

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    if (isset($_POST['email'])) {
        $email = trim($_POST['email']);
        
        // Check if email exists
        $stmt = $pdo->prepare("SELECT id FROM form WHERE email = :email");
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            // Generate 6-digit OTP
            $otp = rand(100000, 999999);
            
            // Store OTP in session
            $_SESSION['reset_otp'] = $otp;
            $_SESSION['reset_email'] = $email;
            
            // Email configuration
            $to = $email;
            $subject = "Password Reset OTP";
            $message = "Your OTP for password reset is: " . $otp;
            $headers = "From: noreply@yourdomain.com\r\n";
            $headers .= "Reply-To: noreply@yourdomain.com\r\n";
            $headers .= "MIME-Version: 1.0\r\n";
            $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
            
            // Send email
            if (mail($to, $subject, $message, $headers)) {
                $success = "OTP has been sent to your email";
            } else {
                $error = "Failed to send OTP. Please try again.";
            }
        } else {
            $error = "Email not found in our system";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Forgot Password - Expenses Tracker</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <div class="container">
        <div class="form-container">
            <h2>Forgot Password</h2>
            <?php if ($error): ?>
                <div class="error-message"><?php echo $error; ?></div>
            <?php endif; ?>
            <?php if ($success): ?>
                <div class="success-message"><?php echo $success; ?></div>
            <?php endif; ?>
            <form method="POST" action="">
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" required 
                           value="<?php echo isset($_POST['email']) ? htmlspecialchars($_POST['email']) : ''; ?>">
                </div>
                <button type="submit" class="btn">Send OTP</button>
            </form>
            <p class="form-footer">Remember your password? <a href="login.php">Login</a></p>
        </div>
    </div>
</body>
</html> 