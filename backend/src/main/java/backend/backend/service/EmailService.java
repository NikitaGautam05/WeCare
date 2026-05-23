package backend.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

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
    public void sendInterestEmail(String to, String userName, String userEmail){
        if(to==null || to.isEmpty()){
            throw new IllegalArgumentException("Email is empty");
        }
        SimpleMailMessage message =new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("New interest in your profile");
        message.setText( "Hello,\n\n" +
                userName + " has shown interest in your profile.\n\n" +
                "You can contact them at: " + userEmail + "\n\n" +
                "Best regards,\nElderEase Team");
        mailSender.send(message);
    }

    public void sendBookingRequestEmail(String to, String userName, String serviceType, String date){
        if(to==null || to.isEmpty()){
            throw new IllegalArgumentException("Email is empty");
        }
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("New Booking Request - " + serviceType);
        message.setText("Hello,\n\n" +
                userName + " has requested a booking for " + serviceType + ".\n" +
                "Date: " + date + "\n\n" +
                "Please log in to your ElderEase dashboard to accept or decline this booking.\n\n" +
                "Best regards,\nElderEase Team");
        mailSender.send(message);
    }

    public void sendBookingConfirmedEmail(String to, String caregiverName, String serviceType, String date){
        if(to==null || to.isEmpty()){
            throw new IllegalArgumentException("Email is empty");
        }
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Booking Confirmed - " + serviceType);
        message.setText("Hello,\n\n" +
                caregiverName + " has confirmed your booking request!\n" +
                "Service: " + serviceType + "\n" +
                "Date: " + date + "\n\n" +
                "You can now chat with your caregiver and arrange the final details.\n\n" +
                "Best regards,\nElderEase Team");
        mailSender.send(message);
    }

    public void sendBookingDeclinedEmail(String to, String caregiverName, String serviceType){
        if(to==null || to.isEmpty()){
            throw new IllegalArgumentException("Email is empty");
        }
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Booking Declined - " + serviceType);
        message.setText("Hello,\n\n" +
                "Unfortunately, " + caregiverName + " has declined your booking request for " + serviceType + ".\n\n" +
                "You can try requesting another caregiver or contact us for assistance.\n\n" +
                "Best regards,\nElderEase Team");
        mailSender.send(message);
    }

    public void sendInterestAcceptedEmail(String to, String caregiverName){
        if(to==null || to.isEmpty()){
            throw new IllegalArgumentException("Email is empty");
        }
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Interest Request Accepted! 🎉");
        message.setText("Hello,\n\n" +
                caregiverName + " has accepted your interest request!\n\n" +
                "You can now start chatting with " + caregiverName + " and arrange the details of the service you need.\n\n" +
                "Log in to your ElderEase dashboard to send a booking request.\n\n" +
                "Best regards,\nElderEase Team");
        mailSender.send(message);
    }

    public void sendInterestDeclinedEmail(String to, String caregiverName){
        if(to==null || to.isEmpty()){
            throw new IllegalArgumentException("Email is empty");
        }
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Interest Request Declined");
        message.setText("Hello,\n\n" +
                caregiverName + " has declined your interest request.\n\n" +
                "You can send interest to other caregivers or explore more options on the ElderEase platform.\n\n" +
                "Best regards,\nElderEase Team");
        mailSender.send(message);
    }
}
