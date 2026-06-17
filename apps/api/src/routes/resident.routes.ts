import { Router } from 'express';
import * as residentController from '../controllers/resident.controller';
import { authenticate, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createResidentSchema,
  updateResidentSchema,
  getResidentSchema,
  queryResidentSchema
} from '../validations/resident.validation';

const router = Router();

// Protect all resident routes
router.use(authenticate);

router
  .route('/')
  .post(authorize('ADMIN'), validate(createResidentSchema), residentController.createResident)
  .get(authorize('ADMIN', 'CARETAKER'), validate(queryResidentSchema), residentController.getResidents);

router
  .route('/:id')
  .get(authorize('ADMIN', 'CARETAKER', 'FAMILY'), validate(getResidentSchema), residentController.getResidentById)
  .patch(authorize('ADMIN'), validate(updateResidentSchema), residentController.updateResident)
  .delete(authorize('ADMIN'), validate(getResidentSchema), residentController.deleteResident);

export default router;
