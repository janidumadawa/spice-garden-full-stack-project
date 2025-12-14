// backend/src/controllers/cart.controller.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();

// create a cart for user (if not exists)
export const createCart = async (req: any, res: Response) => { //when req: Request gives type error for req.userId, then use req: any for now
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "user not authorized" });
    }

    const userId = req.userId; // userId attached by authMiddleware

    let cart = await prisma.cart.findFirst({ //userId is NOT unique → Prisma does not allow findUnique({ where: { userId } }) because multiple carts could theoretically exist per user.
      where: { userId }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId }
      });
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Failed to create cart", error });
  }
};

//add item to cart
export const addItemToCart = async (req: any, res: Response) => {
    try {
        if (!req.userId) {
        return res.status(401).json({ message: "user not authorized" });
    }

    const userId = req.userId; // From authMiddleware - SECURE!
    const { menuItemId, optionIds, quantity, unitPrice } = req.body;

    //find or create cart 
    let cart = await prisma.cart.findFirst({
        where: { userId }
    });

    if (!cart) {
        cart = await prisma.cart.create({
            data: { userId }
        });
    }

    // add item to cart
    const cartItem = await prisma.cartItem.create({
        data: {
            cartId: cart.id,
            menuItemId,
            optionIds: JSON.stringify(optionIds), //store as JSON string
            quantity,
            unitPrice,
        },
    });

    res.json({
        message: "Item added to cart successfully",
        cartId: cart.id,
        item: cartItem,
    });
    } catch (error) {
        res.status(500).json({ error: "Failed to add item to cart" });
    }
};

// get all items in cart
export const getCartItems = async (req: any, res: Response) => { // Use 'any' or extend Request type
    try {
        const userId = req.userId; // From authMiddleware - SECURE!

        const cart = await prisma.cart.findFirst({
            where: { userId },
        });
        
        if (!cart) {
            return res.json({
                cartId: null,
                items: [],
                totalQuantity: 0,
                totalPrice: 0
            });
        }

        const items = await prisma.cartItem.findMany({
            where: { cartId: cart.id },
            include: { 
                menuItem: {
                    include: {
                        options: true
                    }
                } 
            },
        });

        // Calculate totals
        let totalQuantity = 0;
        let totalPrice = 0;
        
        items.forEach((item) => {
            totalQuantity += item.quantity;
            totalPrice += item.quantity * item.unitPrice;
        });

        res.json({
            cartId: cart.id,
            items,
            totalQuantity,
            totalPrice: Number(totalPrice.toFixed(2))
        });
    } catch (error) {
        console.error("Get cart items error:", error);
        res.status(500).json({ error: "Failed to fetch cart items" });
    }
};

// remove item from cart
export const removeCartItem = async (req: Request, res: Response) => { // This one doesn't need userId, so we can keep it as Request
    try {
        const { id } = req.params;

        await prisma.cartItem.delete({
            where: { id },
        });

        res.json({ message: "Cart item removed successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to remove cart item" });
    }
};


//update cart item quantity
export const updateCartItem = async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params; // Cart item ID
    const { quantity } = req.body;

    // First, verify the cart item belongs to the user
    const cartItem = await prisma.cartItem.findFirst({
      where: { id },
      include: {
        cart: true
      }
    });

    if (!cartItem) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    // Check if the cart belongs to the authenticated user
    if (cartItem.cart.userId !== userId) {
      return res.status(403).json({ error: "Not authorized to update this item" });
    }

    // If quantity is 0 or less, remove the item
    if (quantity <= 0) {
      await prisma.cartItem.delete({
        where: { id }
      });
      return res.json({ message: "Item removed from cart" });
    }

    // Update the quantity
    const updatedItem = await prisma.cartItem.update({
      where: { id },
      data: { quantity }
    });

    res.json({
      message: "Cart item updated successfully",
      item: updatedItem
    });
  } catch (error) {
    console.error("Update cart item error:", error);
    res.status(500).json({ error: "Failed to update cart item" });
  }
};