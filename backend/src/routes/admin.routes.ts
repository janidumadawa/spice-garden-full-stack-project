import { Router } from "express";
import { 
    getAllOrders,
    updateOrderStatus,
    getAllMenuItems,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getDashboardStats,
    getAllUsers,
    updateUserRole,
} from "../controllers/admin.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { adminMiddleware } from "../middleware/admin.middleware";

const router = Router();

// All admin routes require both auth and admin middleware
router.use(authMiddleware);
router.use(adminMiddleware);

// Dashboard
router.get("/dashboard/stats", getDashboardStats);

// Order management
router.get("/orders", getAllOrders);
router.put("/orders/:orderId/status", updateOrderStatus);

// Menu item management
router.get("/menu-items", getAllMenuItems);
router.post("/menu-items", createMenuItem);
router.put("/menu-items/:id", updateMenuItem);
router.delete("/menu-items/:id", deleteMenuItem);

// Category management
router.get("/categories", getAllCategories);
router.post("/categories", createCategory);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

router.get("/users", getAllUsers);
router.put("/users/:userId/role", updateUserRole);

export default router;