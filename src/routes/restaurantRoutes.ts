// routes/userRoutes.ts
import express from 'express';
import dotenv from 'dotenv';

import { createProxy } from '../utils/createProxy'
import { auth } from '../middleware/authMiddleware';

dotenv.config();
const router = express.Router();

const RESTAURANT_SERVICE_URL = process.env.RESTAURANT_SERVICE_URL as string;
router.get("/", createProxy(RESTAURANT_SERVICE_URL));

// Get restaurant by ID
router.get("/:id", createProxy(RESTAURANT_SERVICE_URL));

// Create restaurant (optional public? you can restrict later)
router.post("/create", createProxy(RESTAURANT_SERVICE_URL));

// ✅ Protected routes (require auth)
router.use(auth as any);
router.use("/", createProxy(RESTAURANT_SERVICE_URL));

export default router;
