package backend.backend.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import backend.backend.model.AcceptedRequest;
import backend.backend.model.Caregiver;
import backend.backend.model.Message;
import backend.backend.model.Users;
import backend.backend.repository.AcceptedRequestRepository;
import backend.backend.repository.MessageRepository;
import backend.backend.repository.UserRepo;
import backend.backend.service.CaregiverService;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:5173")
public class ChatController {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private AcceptedRequestRepository acceptedRequestRepository;

    @Autowired
    private CaregiverService caregiverService;
    
    @Autowired
    private UserRepo userRepo;

    // ── Get all conversations for a user (both as caregiver and user) ──
    @GetMapping("/conversations/{userId}")
    public ResponseEntity<List<AcceptedRequest>> getConversations(@PathVariable String userId) {
        try {
            List<AcceptedRequest> conversations = acceptedRequestRepository.findByUserId(userId);
            return ResponseEntity.ok(conversations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ── Get all conversations for a caregiver ──
    @GetMapping("/conversations-caregiver/{caregiverId}")
    public ResponseEntity<List<AcceptedRequest>> getConversationsCaregiver(@PathVariable String caregiverId) {
        try {
            List<AcceptedRequest> conversations = acceptedRequestRepository.findByCaregiverId(caregiverId);
            return ResponseEntity.ok(conversations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ── Get all messages for a conversation ──
    @GetMapping("/messages/{conversationId}")
    public ResponseEntity<List<Message>> getMessages(@PathVariable String conversationId) {
        try {
            List<Message> messages = messageRepository.findByConversationIdOrderByTimestampAsc(conversationId);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ── Get unread message count for a recipient ──
    @GetMapping("/unread-count/{userId}")
    public ResponseEntity<Map<String, Object>> getUnreadMessageCount(@PathVariable String userId) {
        try {
            long count = messageRepository.countByRecipientIdAndIsReadFalse(userId);
            return ResponseEntity.ok(Map.of("unreadCount", count));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Mark conversation messages as read for a recipient ──
    @PutMapping("/read/conversation/{conversationId}/{recipientId}")
    public ResponseEntity<Map<String, Object>> markConversationAsRead(
            @PathVariable String conversationId,
            @PathVariable String recipientId) {
        try {
            List<Message> unreadMessages = messageRepository.findByConversationIdAndRecipientIdAndIsReadFalse(conversationId, recipientId);
            for (Message message : unreadMessages) {
                message.setRead(true);
            }
            messageRepository.saveAll(unreadMessages);
            return ResponseEntity.ok(Map.of("marked", unreadMessages.size()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Send a message ──
    @PostMapping("/send")
    public ResponseEntity<Message> sendMessage(
            @RequestParam String conversationId,
            @RequestParam String senderId,
            @RequestParam String senderName,
            @RequestParam String recipientId,
            @RequestParam String text) {
        try {
            Message message = new Message(conversationId, senderId, senderName, recipientId, text);
            Message savedMessage = messageRepository.save(message);
            return ResponseEntity.ok(savedMessage);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    // ── Mark message as read ──
    @PutMapping("/read/{messageId}")
    public ResponseEntity<Message> markAsRead(@PathVariable String messageId) {
        try {
            Message message = messageRepository.findById(messageId).orElse(null);
            if (message != null) {
                message.setRead(true);
                messageRepository.save(message);
            }
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ── Delete a message by its ID ──
    @DeleteMapping("/message/{messageId}")
    public ResponseEntity<Map<String, String>> deleteMessage(@PathVariable String messageId) {
        try {
            if (!messageRepository.existsById(messageId)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Message not found"));
            }
            messageRepository.deleteById(messageId);
            return ResponseEntity.ok(Map.of("message", "Message deleted"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // ── Delete a conversation and all associated messages ──
    @DeleteMapping("/conversation/{conversationId}")
    public ResponseEntity<Map<String, String>> deleteConversation(@PathVariable String conversationId) {
        try {
            AcceptedRequest acceptedRequest = acceptedRequestRepository.findByConversationId(conversationId);
            if (acceptedRequest != null) {
                acceptedRequestRepository.delete(acceptedRequest);
            }

            List<Message> messages = messageRepository.findByConversationIdOrderByTimestampAsc(conversationId);
            if (!messages.isEmpty()) {
                messageRepository.deleteAll(messages);
            }

            return ResponseEntity.ok(Map.of("message", "Conversation deleted"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // ── Create accepted request record when profile is accepted ──
    @PostMapping("/accept")
    public ResponseEntity<AcceptedRequest> createAcceptedRequest(
            @RequestParam String caregiverId,
            @RequestParam String caregiverName,
            @RequestParam String userId,
            @RequestParam String userName) {
        try {
            AcceptedRequest accepted = new AcceptedRequest(caregiverId, caregiverName, userId, userName);
            AcceptedRequest savedRequest = acceptedRequestRepository.save(accepted);
            return ResponseEntity.ok(savedRequest);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    // ── Get accepted caregivers for a care receiver with full details ──
    @GetMapping("/accepted-for-receiver/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getAcceptedConnections(@PathVariable String userId) {
        try {
            System.out.println("🔍 Fetching accepted connections for user: " + userId);
            
            List<AcceptedRequest> acceptedRequests = acceptedRequestRepository.findByUserId(userId);
            System.out.println("📊 Found " + acceptedRequests.size() + " accepted requests");
            
            List<Map<String, Object>> response = new ArrayList<>();
            
            for (AcceptedRequest request : acceptedRequests) {
                System.out.println("  → Processing request: " + request.getId() + " from caregiver: " + request.getCaregiverId());
                
                Caregiver caregiver = caregiverService.getCaregiverById(request.getCaregiverId());
                
                if (caregiver != null) {
                    Map<String, Object> connection = new HashMap<>();
                    connection.put("id", request.getId());
                    connection.put("conversationId", request.getConversationId());
                    connection.put("acceptedAt", request.getAcceptedAt());
                    Message lastMessage = messageRepository.findFirstByConversationIdOrderByTimestampDesc(request.getConversationId());
                    if (lastMessage != null) {
                        connection.put("lastMessageTime", lastMessage.getTimestamp());
                    }
                    
                    // Add caregiver details
                    Map<String, Object> caregiverDetails = new HashMap<>();
                    caregiverDetails.put("id", caregiver.getId());
                    caregiverDetails.put("userName", caregiver.getFullName());
                    caregiverDetails.put("email", caregiver.getEmail());
                    caregiverDetails.put("photo", caregiver.getProfilePhoto());
                    caregiverDetails.put("experience", caregiver.getExperience());
                    caregiverDetails.put("phone", caregiver.getPhoneNumber());
                    caregiverDetails.put("address", caregiver.getAddress());
                    caregiverDetails.put("speciality", caregiver.getSpeciality());
                    caregiverDetails.put("chargeMin", caregiver.getChargeMin());
                    caregiverDetails.put("chargeMax", caregiver.getChargeMax());
                    
                    connection.put("caregiver", caregiverDetails);
                    response.add(connection);
                    System.out.println("    ✓ Added caregiver: " + caregiver.getFullName());
                } else {
                    System.out.println("    ✗ Caregiver not found for ID: " + request.getCaregiverId());
                }
            }
            
            System.out.println("✅ Returning " + response.size() + " connections");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("❌ Error fetching accepted connections: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    // ── Get accepted care receivers for a caregiver with full details ──
    @GetMapping("/accepted-for-caregiver/{caregiverId}")
    public ResponseEntity<List<Map<String, Object>>> getAcceptedConnectionsForCaregiver(@PathVariable String caregiverId) {
        try {
            System.out.println("🔍 Fetching accepted connections for caregiver: " + caregiverId);
            
            List<AcceptedRequest> acceptedRequests = acceptedRequestRepository.findByCaregiverId(caregiverId);
            System.out.println("📊 Found " + acceptedRequests.size() + " accepted requests");
            
            List<Map<String, Object>> response = new ArrayList<>();
            
            for (AcceptedRequest request : acceptedRequests) {
                System.out.println("  → Processing request: " + request.getId() + " from user: " + request.getUserId());
                
                Users user = userRepo.findById(request.getUserId()).orElse(null);
                
                if (user != null) {
                    Map<String, Object> connection = new HashMap<>();
                    connection.put("id", request.getId());
                    connection.put("conversationId", request.getConversationId());
                    connection.put("acceptedAt", request.getAcceptedAt());
                    Message lastMessage = messageRepository.findFirstByConversationIdOrderByTimestampDesc(request.getConversationId());
                    if (lastMessage != null) {
                        connection.put("lastMessageTime", lastMessage.getTimestamp());
                    }
                    
                    // Add user (care receiver) details
                    Map<String, Object> userDetails = new HashMap<>();
                    userDetails.put("id", user.getId());
                    userDetails.put("userName", user.getUserName());
                    userDetails.put("email", user.getEmail());
                    userDetails.put("photo", user.getPhoto());
                    userDetails.put("address", user.getAddress());
                    userDetails.put("serviceType", user.getServiceType());
                    userDetails.put("receiverType", user.getReceiverType());
                    userDetails.put("additionalInfo", user.getAdditionalInfo());
                    
                    connection.put("user", userDetails);
                    response.add(connection);
                    System.out.println("    ✓ Added user: " + user.getUserName());
                } else {
                    System.out.println("    ✗ User not found for ID: " + request.getUserId());
                }
            }
            
            System.out.println("✅ Returning " + response.size() + " connections");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("❌ Error fetching caregiver accepted connections: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
}
