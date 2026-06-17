import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/admin', authorize('ADMIN'), analyticsController.getAdminAnalytics);
router.get('/admin/weekly-trends', authorize('ADMIN'), analyticsController.getWeeklyTrends);
router.get('/caretaker', authorize('CARETAKER'), analyticsController.getCaretakerAnalytics);
router.get('/family', authorize('FAMILY'), analyticsController.getFamilyAnalytics);

export default router;
