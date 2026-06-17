import { Router } from 'express';
import * as messageController from '../controllers/message.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { sendMessageSchema, getMessagesSchema } from '../validations/message.validation';

const router = Router();

router.use(authenticate);

router
  .route('/')
  .post(validate(sendMessageSchema), messageController.sendMessage)
  .get(validate(getMessagesSchema), messageController.getMessages);

export default router;
