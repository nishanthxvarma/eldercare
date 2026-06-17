import { Message, IMessage } from '../models/Message';
import { getIO } from '../utils/socket';

export class MessageService {
  static async sendMessage(senderId: string, receiverId: string, content: string) {
    const message = await Message.create({ senderId, receiverId, content });
    
    // Emit via Socket.io
    const io = getIO();
    io.to(receiverId).emit('new_message', message);
    
    return message;
  }

  static async getMessagesBetweenUsers(userId1: string, userId2: string) {
    const messages = await Message.find({
      $or: [
        { senderId: userId1, receiverId: userId2, isDeletedBySender: false },
        { senderId: userId2, receiverId: userId1, isDeletedByReceiver: false }
      ]
    }).sort({ createdAt: 1 });
    
    return messages;
  }
}
