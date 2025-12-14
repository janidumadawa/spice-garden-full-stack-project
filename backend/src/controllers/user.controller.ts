// backend/src/controllers/user.controller.ts
import { Request, Response } from "express"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt";
import { User } from "@prisma/client";


const prisma = new PrismaClient()

//create user
export const createUser = async (req: Request, res: Response) => {
  const { name, email, password, role = "user" } = req.body

  try {
  //hash password
  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, role } 
  })

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

//get all users
export const getUsers = async (req: Request, res: Response) => {
  const users = await prisma.user.findMany()

  // Remove passwords from response
  const usersWithoutPasswords = users.map( (user: User) => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
  res.json(usersWithoutPasswords);
}

//get current user
export const getCurrentUser = async (req: any, res: Response) => {
  try {
    const userId = req.userId; 
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) return res.status(404).json({ message: "User not found" });

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};


// Update profile
export const updateProfile = async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    const { name, phone } = req.body;
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name, phone }
    });
    
    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Change password
export const changePassword = async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword } = req.body;
    
    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });
    
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};