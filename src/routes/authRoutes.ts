// routes/userRoutes.ts
import express from 'express';
import dotenv from 'dotenv';

import { createProxy } from '../utils/createProxy'

dotenv.config();
const router = express.Router();

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL as string;

router.use('/', createProxy(AUTH_SERVICE_URL));

export default router;

