import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt"; 
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ 
                message: "Email and password are required" 
            });
        }

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(401).json({ 
                message: "Invalid email or password" 
            });
        }

        // Verify JWT_SECRET is set
        if (!process.env.JWT_SECRET) {
            console.error("ERROR: JWT_SECRET is not set in environment variables");
            return res.status(500).json({ 
                message: "Server configuration error" 
            });
        }

        // Compare passwords using bcrypt
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ 
                message: "Invalid email or password" 
            });
        }

        // Create JWT token
        const token = jwt.sign(
            { 
                userId: user.id,
                email: user.email,
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Success response
        res.status(200).json({ 
            success: true,
            message: "Login successful",
            token,
            user: { 
                id: user.id, 
                name: user.name, 
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });

    } catch (error: any) {
        console.error("Login error:", error);
        res.status(500).json({ 
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
};