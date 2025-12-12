// backend/src/controllers/category.controller.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient();

//create category
export const createCategory = async (req: Request, res: Response) => {
  const { name, description } = req.body;

    const category = await prisma.category.create({
        data: { name, description },
    });
    res.json(category);
};

//get all categories
export const getCategories = async (req: Request, res: Response) => {
    const categories = await prisma.category.findMany();
    res.json(categories);
};

//get category by id
export const getCategory = async (req: Request, res: Response) => {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
        where: { id },
    });

    if (!category) {
        return res.status(404).json({ message: "Category not found" });
    }
    res.json(category);
};

//update category
export const updateCategory = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description } = req.body;

    const category = await prisma.category.update({
        where: { id },
        data: { name, description },
    });
    res.json(category);
}

//delete category
export const deleteCategory = async (req: Request, res: Response) => {
    const { id } = req.params;

    await prisma.category.delete({
        where: { id },
    });
    res.json({ message: "Category deleted" });
}
