package backend.backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import backend.backend.model.Message;

@Repository
public interface MessageRepository extends MongoRepository<Message, String> {
    List<Message> findByConversationIdOrderByTimestampAsc(String conversationId);
    Message findFirstByConversationIdOrderByTimestampDesc(String conversationId);
    List<Message> findBySenderIdOrRecipientId(String senderId, String recipientId);
    long countByRecipientIdAndIsReadFalse(String recipientId);
    List<Message> findByConversationIdAndRecipientIdAndIsReadFalse(String conversationId, String recipientId);
}
