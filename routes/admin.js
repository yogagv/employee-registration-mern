import express from 'express';
import { getAllAdmins, getSingleAdmin, updateAdmin } from '../controller/adminController.js';
import { authenticate, restrict } from '../auth/verifyToken.js';

const router = express.Router();

router.get('/allAdmin', authenticate, restrict(['admin']), getAllAdmins);
router.get('/singleAdmin/:id', getSingleAdmin);
router.put('/updateAdmin/:id', authenticate, restrict(['admin']), updateAdmin);

export default router