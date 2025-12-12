// backend/src/controllers/menuItem.controller.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// create menu item
export const createMenuItem = async (req: Request, res: Response) => {
    try {
        const { name, description, basePrice, imageUrl, categoryId } = req.body;

        const menuItem = await prisma.menuItem.create({
            data: {
                name,
                description,
                basePrice,
                imageUrl,
                categoryId,
            },
        });

        res.json(menuItem);
    } catch (error) {
        res.status(500).json({ error: "Failed to create menu item" });
    }
};

// get all menu items
export const getMenuItems = async (req: Request, res: Response) => {
    try {
        const { categoryId } = req.query; //get categoryId from query string

        const whereClause = categoryId ? { categoryId: String(categoryId) } : {};
        
        const menuItems = await prisma.menuItem.findMany({ 
            where: whereClause,
            include: {
                category: true,
                options: true}
        });

        res.json(menuItems);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch menu items" });
    }
};


// get single menu item by id
export const getMenuItemById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const menuItem = await prisma.menuItem.findUnique({
            where:{id},
            include: {
                category: true,
            options: true}
        });

        if (!menuItem) {
            return res.status(404).json({ error: "Menu item not found" });
        }

        res.json(menuItem);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch menu item" });
    }
}

// Update Menu Item
export const updateMenuItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, basePrice, imageUrl, isAvailable, categoryId } = req.body;

    const updatedItem = await prisma.menuItem.update({
      where: { id },
      data: {
        name,
        description,
        basePrice: basePrice ? Number(basePrice) : undefined,
        imageUrl,
        isAvailable,
        categoryId
      },
      include: { category: true, options: true }
    });

    res.json(updatedItem);
  } catch (error) {
    console.error("Update MenuItem Error:", error);
    res.status(500).json({ message: "Failed to update menu item", error });
  }
};


// delete menu item
export const deleteMenuItem = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.menuItem.delete({
            where: { id },
        });
        res.json({ message: "Menu item deleted successfully" });

    } catch (error) {
        res.status(500).json({ error: "Failed to delete menu item" });
    }
};
