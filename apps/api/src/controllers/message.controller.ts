import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { MessageService } from '../services/message.service';

export const sendMessage = catchAsync(async (req: Request, res: Response) => {
  const senderId = req.user._id;
  const { receiverId, content } = req.body;
  const message = await MessageService.sendMessage(senderId, receiverId, content);
  
  res.status(201).json({
    success: true,
    data: message,
    message: 'Message sent successfully'
  });
});

export const getMessages = catchAsync(async (req: Request, res: Response) => {
  const userId1 = req.user._id;
  const userId2 = req.query.otherUserId as string;
  const messages = await MessageService.getMessagesBetweenUsers(userId1, userId2);
  
  res.status(200).json({
    success: true,
    data: messages
  });
});
