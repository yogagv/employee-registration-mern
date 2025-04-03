import express from 'express'
import { authenticate, restrict } from '../auth/verifyToken.js';
import { employeeLogin, employeeRegister } from '../controller/empAuthController.js';

const router = express.Router();

router.post('/registerEmployee/:id', authenticate, restrict(['admin']), employeeRegister);
router.post('/loginEmployee', employeeLogin);
export default router