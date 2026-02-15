package com.edu.edupage.service;

import jakarta.mail.AuthenticationFailedException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Value("${app.url}")
    private String appUrl;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendPasswordResetEmail(String email, String resetToken) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true);
            helper.setFrom(fromEmail);
            helper.setTo(email);
            helper.setSubject("Password Reset Request");
            helper.setText("To reset your password, click the link below:\n\n" +
                    appUrl + "/reset-password?token=" + resetToken + "\n\n" +
                    "This link will expire in 24 hours.\n\n" +
                    "If you did not request this, please ignore this email.", false);
            mailSender.send(mimeMessage);
            System.out.println("Email sent successfully to: " + email);
        } catch (MailAuthenticationException e) {
            Throwable cause = e.getCause();
            if (cause instanceof AuthenticationFailedException) {
                System.err.println("==========================================");
                System.err.println("GMAIL AUTHENTICATION FAILED");
                System.err.println("==========================================");
                System.err.println("Error: " + cause.getMessage());
                System.err.println("==========================================");
            } else {
                System.err.println("Email Authentication failed: " + e.getMessage());
                System.err.println("Please verify your email credentials in application.properties");
            }
            e.printStackTrace();
            throw new RuntimeException("Failed to authenticate with email server. Please check your email credentials.", e);
        } catch (MailSendException e) {
            System.err.println("Failed to send email: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to send email.", e);
        } catch (Exception e) {
            System.err.println("Unexpected error sending email: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
        }
    }
}

