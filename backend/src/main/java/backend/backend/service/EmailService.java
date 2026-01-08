package backend.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Random;


@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendOtp(String to, String otp) {
        if (to == null || to.isEmpty()) {
            throw new IllegalArgumentException("Email address is null or empty");
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Your OTP Code");
        message.setText("Your OTP is: " + otp);
        mailSender.send(message);
    }
    public void signupNotification(String to,String name){
        if (to== null || to .isEmpty()){
            throw new IllegalArgumentException("Email address is empty.");

        }
        SimpleMailMessage message= new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Welcome to ElderEase");
        message.setText("Hello"+name+",\n\n"+
                "Thank you for signing up! We're excited to have you on board.\n\n" +
                "Best regards,\nElderEase Team");
        mailSender.send(message);
    }
}
