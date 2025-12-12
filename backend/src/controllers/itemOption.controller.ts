// backend/src/controllers/itemOption.controller.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// create item option
export const createItemOption = async (req: Request, res: Response) => {
    try {
        const { menuItemId, name, extraPrice } = req.body;

        const option = await prisma.itemOption.create({
            data: {
                menuItemId,
                name,
                extraPrice: Number(extraPrice),
            },
        });

        res.json(option);
    } catch (error) {
        console.error("Create ItemOption Error:", error);
        res.status(500).json({ error: "Failed to create item option" });
    }
}

// get item options by menu item id
export const getItemOptionsByMenuItem = async (req: Request, res: Response) => {
    try {
        const { menuItemId } = req.params;

        const options = await prisma.itemOption.findMany({
            where: { menuItemId },
        });

        res.json(options);
    } catch (error) {
        console.error("Get ItemOptions Error:", error);
        res.status(500).json({ error: "Failed to fetch item options" });
    }
}

// delete item option
export const deleteItemOption = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.itemOption.delete({
            where: { id },
        });

        res.json({ message: "Item option deleted successfully" });
    } catch (error) {
        console.error("Delete ItemOption Error:", error);
        res.status(500).json({ error: "Failed to delete item option" });
    }
}

// update item option
export const updateItemOption = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, extraPrice } = req.body;

        const updatedOption = await prisma.itemOption.update({
            where: { id },
            data: {
                name,
                extraPrice: Number(extraPrice),
            },
        });

        res.json(updatedOption);
    } catch (error) {
        console.error("Update ItemOption Error:", error);
        res.status(500).json({ error: "Failed to update item option" });
    }
}

