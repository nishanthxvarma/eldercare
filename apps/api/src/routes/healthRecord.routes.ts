import { Router } from 'express';
import * as healthRecordController from '../controllers/healthRecord.controller';
import { authenticate, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createHealthRecordSchema,
  getHealthRecordSchema,
  queryHealthRecordSchema
} from '../validations/healthRecord.validation';

const router = Router();

router.use(authenticate);

router
  .route('/')
  .post(authorize('ADMIN', 'CARETAKER'), validate(createHealthRecordSchema), healthRecordController.createHealthRecord)
  .get(authorize('ADMIN', 'CARETAKER', 'FAMILY'), validate(queryHealthRecordSchema), healthRecordController.getHealthRecords);

router
  .route('/:id')
  .get(authorize('ADMIN', 'CARETAKER', 'FAMILY'), validate(getHealthRecordSchema), healthRecordController.getHealthRecordById);

export default router;
