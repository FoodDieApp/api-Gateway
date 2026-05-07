// routes/userRoutes.ts
import express from 'express';
import dotenv from 'dotenv';

import { createProxy } from '../utils/createProxy'
import { auth } from '../middleware/authMiddleware';

dotenv.config();
const router = express.Router();

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL as string;
router.get("/", createProxy(PRODUCT_SERVICE_URL)); // e.g., GET /products
router.get("/:id", createProxy(PRODUCT_SERVICE_URL)); 
router.use(auth as any);
router.use('/', createProxy(PRODUCT_SERVICE_URL));

export default router;
