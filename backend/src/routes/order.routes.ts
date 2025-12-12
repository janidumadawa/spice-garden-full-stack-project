import { Router } from "express";
import {
    placeOrder,
    getOrderDetails,
    getUserOrders,
} from "../controllers/order.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authMiddleware, placeOrder); 
router.get("/:orderId", authMiddleware, getOrderDetails); 
router.get("/user/current", authMiddleware, getUserOrders); 

export default router;