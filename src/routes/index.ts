import { auth } from "../middleware/authMiddleware";
import authRoutes from "./authRoutes";
import restaurantRoutes from "./restaurantRoutes";
import userRoutes from "./userRoutes";
import orderRoutes from "./orderRoutes";
import { Router } from 'express';
import productsRoutes from './productRoutes'
const router = Router();

    
router.use("/auth", authRoutes);
router.use("/restaurant", restaurantRoutes);
router.use("/products", productsRoutes);
router.use('/user', userRoutes);
router.use('/order', orderRoutes);

export default router; 