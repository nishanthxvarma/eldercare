import { z } from 'zod';

export const sendMessageSchema = z.object({
  body: z.object({
    receiverId: z.string().min(1),
    content: z.string().min(1),
  }),
});

export const getMessagesSchema = z.object({
  query: z.object({
    otherUserId: z.string().min(1),
  }),
});
