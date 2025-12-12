import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get user addresses
export const getUserAddresses = async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' }
    });
    
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Add new address
export const addAddress = async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    const { street, city, zipCode, isDefault = false } = req.body;
    
    // If setting as default, update all other addresses to not default
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false }
      });
    }
    
    const address = await prisma.address.create({
      data: {
        userId,
        street,
        city,
        zipCode,
        isDefault
      }
    });
    
    res.json(address);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update address
export const updateAddress = async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    const addressId = req.params.id;
    const { street, city, zipCode, isDefault } = req.body;
    
    // Check if address belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: { id: addressId, userId }
    });
    
    if (!existingAddress) {
      return res.status(404).json({ message: "Address not found" });
    }
    
    // If setting as default, update all other addresses
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId, id: { not: addressId } },
        data: { isDefault: false }
      });
    }
    
    const updatedAddress = await prisma.address.update({
      where: { id: addressId },
      data: { street, city, zipCode, isDefault }
    });
    
    res.json(updatedAddress);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete address
export const deleteAddress = async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    const addressId = req.params.id;
    
    // Check if address belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: { id: addressId, userId }
    });
    
    if (!existingAddress) {
      return res.status(404).json({ message: "Address not found" });
    }
    
    await prisma.address.delete({
      where: { id: addressId }
    });
    
    res.json({ message: "Address deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Set default address
export const setDefaultAddress = async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    const addressId = req.params.id;
    
    // Check if address belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: { id: addressId, userId }
    });
    
    if (!existingAddress) {
      return res.status(404).json({ message: "Address not found" });
    }
    
    // Update all addresses to not default
    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false }
    });
    
    // Set this address as default
    const updatedAddress = await prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true }
    });
    
    res.json(updatedAddress);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};