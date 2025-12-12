// backend/src/routes/menuItem.routes.ts
import { Router } from "express";
import { 
    createMenuItem, 
    getMenuItems,
    getMenuItemById,
    updateMenuItem,
    deleteMenuItem,
 } from "../controllers/menuItem.controller";

const router = Router();

router.post("/", createMenuItem);
router.get("/", getMenuItems);
router.get("/:id", getMenuItemById);
router.put("/:id", updateMenuItem);
router.delete("/:id", deleteMenuItem);

export default router;