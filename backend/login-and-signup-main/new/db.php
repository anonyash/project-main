<?php
$con = mysqli_connect("localhost", "root", "", "user_login_db");
if (!$con) {
    die("Connection failed: " . mysqli_connect_error());
}
?>