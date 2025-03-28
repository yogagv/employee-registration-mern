import express from 'express';
import { getAllAdmins, getSingleAdmin } from '../controller/adminController.js';
import { authenticate, restrict } from '../auth/verifyToken.js';

const router = express.Router();

router.get('/allAdmin', authenticate, restrict(['admin']), getAllAdmins)
router.get('/singleAdmin', getSingleAdmin)

export default router