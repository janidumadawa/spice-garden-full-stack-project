// backend/src/routes/cart.routes.ts
import { Router } from "express";
import {
    createCart,
    addItemToCart,
    getCartItems,
    removeCartItem,
    updateCartItem,
} from "../controllers/cart.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authMiddleware, createCart);
router.get("/current", authMiddleware, getCartItems); 
router.post("/item", authMiddleware, addItemToCart); 
router.delete("/item/:id", authMiddleware, removeCartItem);
router.put("/item/:id", authMiddleware, updateCartItem);

export default router;