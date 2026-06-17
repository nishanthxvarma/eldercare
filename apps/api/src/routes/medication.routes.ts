import { Router } from 'express';
import * as medicationController from '../controllers/medication.controller';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router
  .route('/')
  .post(authorize('ADMIN', 'CARETAKER'), medicationController.createMedication)
  .get(authorize('ADMIN', 'CARETAKER', 'FAMILY'), medicationController.getMedications);

router
  .route('/:id')
  .get(authorize('ADMIN', 'CARETAKER', 'FAMILY'), medicationController.getMedicationById)
  .patch(authorize('ADMIN', 'CARETAKER'), medicationController.updateMedication)
  .delete(authorize('ADMIN'), medicationController.deleteMedication);

router.post('/:id/log', authorize('ADMIN', 'CARETAKER'), medicationController.logAdministration);
router.get('/:id/logs', authorize('ADMIN', 'CARETAKER', 'FAMILY'), medicationController.getMedicationLogs);

export default router;
