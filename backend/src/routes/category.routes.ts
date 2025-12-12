// backend/src/routes/category.routes.ts
import { Router } from "express"
import { 
    createCategory, 
    getCategories, 
    getCategory, 
    updateCategory, 
    deleteCategory } from "../controllers/category.controller";

const router = Router();

router.post("/", createCategory);
router.get("/", getCategories);
router.get("/:id", getCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;