<?php
    if(isset($_POST['submit'])) {
        $name = $_POST['name'];
        $email = $_POST['email'];
        $message = $_POST['message'];
        $to = "christopher.kornosky@gmail.com";
        $subject = "New message from Pet Sitting Services website";
        $headers = "From: ".$email;
        mail($to,$subject,$message,$headers);
        echo "Your message has been sent.";
    }
?>
