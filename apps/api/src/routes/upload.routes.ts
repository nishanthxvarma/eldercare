import { Router } from 'express';
import * as uploadController from '../controllers/upload.controller';
import { authorize } from '../middlewares/auth';
import { upload } from '../middlewares/upload';

const router = Router();

router.post('/photo', authorize('ADMIN', 'CARETAKER', 'FAMILY'), upload.single('photo'), uploadController.uploadPhoto);

export default router;
