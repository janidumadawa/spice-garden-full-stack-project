// backend/src/controllers/login.controller.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        //find uswer by email
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        //compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // create JWT token 
        const token = jwt.sign(
            { userId: user.id}, // playload inside token
            process.env.JWT_SECRET!, // secret key from environment variable
            { expiresIn: "7d" } // token valid for 7 days
        );

        //success -> return user id, name and token
        res.status(200).json({ 
            message: "Login success",
            token,
            user: { 
                id: user.id, 
                name: user.name, 
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};