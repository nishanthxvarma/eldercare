import { Request, Response } from 'express';
import { Router } from 'express';
import { Notification } from '../models/Notification';
import { authenticate } from '../middlewares/auth';
import { catchAsync } from '../utils/catchAsync';

const router = Router();
router.use(authenticate);

router.get('/', catchAsync(async (req: Request, res: Response) => {
  const query: any = { userId: req.user.id };
  const { isRead } = req.query as Record<string, string>;
  if (isRead !== undefined) {
    query.isRead = isRead === 'true';
  }
  const notifications = await Notification.find(query).sort({ createdAt: -1 });
  const unreadCount = await Notification.countDocuments({ userId: req.user.id, isRead: false });
  res.status(200).json({ success: true, data: notifications, unreadCount });
}));

router.patch('/read-all', catchAsync(async (req: Request, res: Response) => {
  await Notification.updateMany(
    { userId: req.user.id, isRead: false },
    { $set: { isRead: true } }
  );
  res.status(200).json({ success: true, message: 'All notifications marked as read' });
}));

router.patch('/:id/read', catchAsync(async (req: Request, res: Response) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { $set: { isRead: true } },
    { new: true }
  );
  res.status(200).json({ success: true, data: notification });
}));

router.delete('/:id', catchAsync(async (req: Request, res: Response) => {
  await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  res.status(200).json({ success: true, message: 'Notification deleted' });
}));

export default router;
