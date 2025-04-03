import express from 'express'
import { loginAdmin, registerAdmin } from '../controller/authController.js';


const router = express.Router();

//admin
router.post('/registerAdmin', registerAdmin);
router.post('/loginAdmin', loginAdmin);

export default router