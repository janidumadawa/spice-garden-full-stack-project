// backend/src/routes/itemOption.routes.ts
import { Router } from "express";

import { 
    createItemOption, 
    getItemOptionsByMenuItem,
    deleteItemOption,
    updateItemOption,
 } from "../controllers/itemOption.controller";

const router = Router();

router.post("/", createItemOption);
router.get("/:menuItemId", getItemOptionsByMenuItem);
router.delete("/:id", deleteItemOption);
router.put("/:id", updateItemOption);

export default router;