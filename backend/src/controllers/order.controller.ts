// backend/src/controllers/order.controller.ts
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// place order - UPDATED to accept addressId
export const placeOrder = async (req: any, res: Response) => {
    try {
        const userId = req.userId;
        const { 
            address,        // Full address string (for manual entry)
            addressId,      // ID of saved address (optional)
            paymentStatus = "pending", 
            promoCodeId,
            notes           // Delivery notes
        } = req.body;

        // Determine delivery address
        let deliveryAddress = address;
        
        // If addressId is provided, fetch from saved addresses
        if (addressId) {
            const savedAddress = await prisma.address.findFirst({
                where: { 
                    id: addressId,
                    userId: userId 
                }
            });
            
            if (!savedAddress) {
                return res.status(400).json({ error: "Saved address not found" });
            }
            
            deliveryAddress = `${savedAddress.street}, ${savedAddress.city} ${savedAddress.zipCode}`;
        }

        // Step 1: Get user cart + items
        const cart = await prisma.cart.findFirst({
            where: { userId },
            include: { items: true },
        });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ error: "Cart is empty or does not exist" });
        }

        // Step 2: Calculate total amount
        let subtotal = 0;
        cart.items.forEach(item => {
            subtotal += item.quantity * item.unitPrice;
        });

        const tax = subtotal * 0.1;
        const deliveryFee = 200;
        let totalAmount = subtotal + tax + deliveryFee;

        // Step 3: Create order
        const order = await prisma.order.create({
            data: {
                userId,
                address: deliveryAddress,
                tax,
                deliveryFee,
                totalAmount,
                promoCodeId,
                paymentStatus,
                orderStatus: "pending",
            },
        });

        // Step 4: Store order items
        for (const item of cart.items) {
            await prisma.orderItem.create({
                data: {
                    orderId: order.id,
                    menuItemId: item.menuItemId,
                    optionIds: item.optionIds,
                    quantity: item.quantity,
                    price: item.unitPrice,
                },
            });
        }

        // Step 5: Clear user cart completely
        await prisma.$transaction(async (tx) => {
        await tx.cartItem.deleteMany({
            where: { cartId: cart.id },
        });

        //delete the cart itself
        await tx.cart.delete({
            where: { id: cart.id },
        });
        });

        res.json({ 
            message: "Order placed successfully", 
            orderId: order.id,
            order 
        });
    } catch (error) {
        console.error("Place Order Error:", error);
        res.status(500).json({ error: "Failed to place order" });
    }
};

// Get order details (no changes needed)
export const getOrderDetails = async (req: any, res: Response) => {
    try {
        const { orderId } = req.params;

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: {
                        menuItem: true,
                    },
                },
            },
        });

        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        res.json(order);
    } catch (error) {
        console.error("Get Order Details Error:", error);
        res.status(500).json({ error: "Failed to fetch order details" });
    }
};

// Get user orders (no changes needed)
export const getUserOrders = async (req: any, res: Response) => {
    try {
        const userId = req.userId;

        const orders = await prisma.order.findMany({
            where: { userId },
            include: {
                items: {
                    include: {
                        menuItem: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.json(orders);
    } catch (error) {
        console.error("Get User Orders Error:", error);
        res.status(500).json({ error: "Failed to fetch user orders" });
    }
};