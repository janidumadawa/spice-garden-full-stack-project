import { Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const adminMiddleware = async (req: any, res: Response, next: NextFunction) => {
    try {
        //get user from database to check role
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: { role: true },
        });

        if (!user || user.role !== "admin") {
            return res.status(403).json({ error: "Access denied. Admins only." });
        }

        //add user role to requeest for further use
        req.userRole = user.role;
        next();
    } catch (error) {
        console.error("Admin Middleware Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};