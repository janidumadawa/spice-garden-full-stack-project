// backend/src/routes/user.routes.ts
import { Router } from "express"
import { createUser, getCurrentUser, getUsers, updateProfile, changePassword } from "../controllers/user.controller" // correct path
import { loginUser } from "../controllers/login.controller"
import { authMiddleware } from "../middleware/auth.middleware"

const router = Router()

router.post("/", createUser) // create user
router.get("/", getUsers) // get all users
router.post("/login", loginUser) // login user

router.get("/me", authMiddleware, getCurrentUser)
router.put("/profile", authMiddleware, updateProfile); 
router.put("/change-password", authMiddleware, changePassword); 


export default router