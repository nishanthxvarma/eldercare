import { Request, Response } from 'express';
import { Router } from 'express';
import { ActivityLog } from '../models/ActivityLog';
import { authenticate, authorize } from '../middlewares/auth';
import { catchAsync } from '../utils/catchAsync';

const router = Router();
router.use(authenticate);

router.get('/', authorize('ADMIN', 'CARETAKER'), catchAsync(async (req: Request, res: Response) => {
  const facilityId = req.user.facilityId;
  const limit = Number(req.query.limit) || 20;
  const activities = await ActivityLog.find({ facilityId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'firstName lastName role');
  res.status(200).json({ success: true, data: activities });
}));

export default router;

