import express from 'express'
import { employeeDelete, employeeUpdate, getAllEmployees, getSingleEmployee } from '../controller/employeeController.js';
import { authenticate, restrict } from '../auth/verifyToken.js';

const router = express.Router();

router.get('/allEmployees', authenticate, restrict(['admin']), getAllEmployees);
router.get('/singleEmployee/:id', getSingleEmployee);
router.put('/updateEmployee/:id', authenticate, restrict(['admin']), employeeUpdate);
router.delete('/deleteEmployee/:id', authenticate, restrict(['admin']), employeeDelete);

export default router