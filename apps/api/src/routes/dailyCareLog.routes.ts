import { Router } from 'express';
import * as dailyCareLogController from '../controllers/dailyCareLog.controller';
import { authenticate, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createCareLogSchema,
  getCareLogSchema,
  queryCareLogSchema
} from '../validations/dailyCareLog.validation';

const router = Router();

router.use(authenticate);

router
  .route('/')
  .post(authorize('ADMIN', 'CARETAKER'), validate(createCareLogSchema), dailyCareLogController.createCareLog)
  .get(authorize('ADMIN', 'CARETAKER', 'FAMILY'), validate(queryCareLogSchema), dailyCareLogController.getCareLogs);

router
  .route('/:id')
  .get(authorize('ADMIN', 'CARETAKER', 'FAMILY'), validate(getCareLogSchema), dailyCareLogController.getCareLogById);

export default router;
