// routes/userRoutes.ts
import express from 'express';
import dotenv from 'dotenv';
import { auth } from '../middleware/authMiddleware';
import { createProxy } from '../utils/createProxy'
import { keycloakAuth } from '../middleware/keycloakAuth';

dotenv.config();
const router = express.Router();

const USER_SERVICE_URL = process.env.USER_SERVICE_URL as string;

// Route without auth: /create
router.use('/create', createProxy(USER_SERVICE_URL));

// Routes with auth
router.use(auth as any); // Apply auth middleware to all routes below this line
router.use('/', createProxy(USER_SERVICE_URL));

export default router;
