import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

// All users (for messaging contacts)
router.get('/', authorize('ADMIN', 'CARETAKER', 'FAMILY'), userController.getUsers);

// Admin-only CRUD for staff
router.post('/', authorize('ADMIN'), userController.createUser);
router.get('/:id', authorize('ADMIN'), userController.getUserById);
router.patch('/:id', authorize('ADMIN'), userController.updateUser);
router.delete('/:id', authorize('ADMIN'), userController.deleteUser);
router.patch('/:id/assign-residents', authorize('ADMIN'), userController.assignResidents);

export default router;
