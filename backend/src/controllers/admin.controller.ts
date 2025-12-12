import { Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ========== ORDER MANAGEMENT ==========

// Get all orders (admin only)
export const getAllOrders = async (req: any, res: Response) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        
        const whereClause: any = {};
        if (status && status !== 'all') {
            whereClause.orderStatus = status;
        }

        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where: whereClause,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                        }
                    },
                    items: {
                        include: {
                            menuItem: {
                                select: {
                                    name: true,
                                    basePrice: true,
                                }
                            },
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take: parseInt(limit as string),
            }),
            prisma.order.count({ where: whereClause })
        ]);

        res.json({
            orders,
            pagination: {
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                total,
                pages: Math.ceil(total / parseInt(limit as string)),
            }
        });
    } catch (error) {
        console.error("Get All Orders Error:", error);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
};

// Update order status (admin only)
export const updateOrderStatus = async (req: any, res: Response) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const validStatuses = ["pending", "preparing", "out_for_delivery", "delivered", "cancelled"];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        const order = await prisma.order.update({
            where: { id: orderId },
            data: { orderStatus: status },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    }
                }
            }
        });

        res.json({ 
            message: "Order status updated successfully", 
            order 
        });
    } catch (error) {
        console.error("Update Order Status Error:", error);
        res.status(500).json({ error: "Failed to update order status" });
    }
};

// ========== MENU ITEM MANAGEMENT ==========

// Get all menu items with categories (admin only)
export const getAllMenuItems = async (req: any, res: Response) => {
    try {
        const menuItems = await prisma.menuItem.findMany({
            include: {
                category: true,
                options: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json(menuItems);
    } catch (error) {
        console.error("Get All Menu Items Error:", error);
        res.status(500).json({ error: "Failed to fetch menu items" });
    }
};

// Create menu item (admin only)
export const createMenuItem = async (req: any, res: Response) => {
    try {
        const { name, description, basePrice, imageUrl, categoryId, isAvailable = true } = req.body;

        const menuItem = await prisma.menuItem.create({
            data: {
                name,
                description,
                basePrice: parseFloat(basePrice),
                imageUrl,
                categoryId,
                isAvailable,
            },
            include: {
                category: true,
            }
        });

        res.status(201).json(menuItem);
    } catch (error) {
        console.error("Create Menu Item Error:", error);
        res.status(500).json({ error: "Failed to create menu item" });
    }
};

// Update menu item (admin only)
export const updateMenuItem = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description, basePrice, imageUrl, categoryId, isAvailable } = req.body;

        const menuItem = await prisma.menuItem.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(description && { description }),
                ...(basePrice && { basePrice: parseFloat(basePrice) }),
                ...(imageUrl && { imageUrl }),
                ...(categoryId && { categoryId }),
                ...(isAvailable !== undefined && { isAvailable }),
            },
            include: {
                category: true,
                options: true,
            }
        });

        res.json(menuItem);
    } catch (error) {
        console.error("Update Menu Item Error:", error);
        res.status(500).json({ error: "Failed to update menu item" });
    }
};

// Delete menu item (admin only)
export const deleteMenuItem = async (req: any, res: Response) => {
    try {
        const { id } = req.params;

        // Check if menu item exists in any orders
        const orderItems = await prisma.orderItem.count({
            where: { menuItemId: id }
        });

        if (orderItems > 0) {
            return res.status(400).json({ 
                error: "Cannot delete menu item that exists in orders. Mark as unavailable instead." 
            });
        }

        await prisma.menuItem.delete({
            where: { id }
        });

        res.json({ message: "Menu item deleted successfully" });
    } catch (error) {
        console.error("Delete Menu Item Error:", error);
        res.status(500).json({ error: "Failed to delete menu item" });
    }
};

// ========== CATEGORY MANAGEMENT ==========

// Get all categories (admin only)
export const getAllCategories = async (req: any, res: Response) => {
    try {
        const categories = await prisma.category.findMany({
            include: {
                _count: {
                    select: { menuItems: true }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });

        res.json(categories);
    } catch (error) {
        console.error("Get All Categories Error:", error);
        res.status(500).json({ error: "Failed to fetch categories" });
    }
};

// Create category (admin only)
export const createCategory = async (req: any, res: Response) => {
    try {
        const { name, description } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ error: "Category name is required" });
        }

        // Check if category already exists
        const existingCategory = await prisma.category.findFirst({
            where: {
                name: {
                    equals: name.trim(),
                    mode: 'insensitive'
                }
            }
        });

        if (existingCategory) {
            return res.status(400).json({ error: "Category with this name already exists" });
        }

        const category = await prisma.category.create({
            data: {
                name: name.trim(),
                description: description?.trim()
            },
            include: {
                _count: {
                    select: { menuItems: true }
                }
            }
        });

        res.status(201).json(category);
    } catch (error) {
        console.error("Create Category Error:", error);
        res.status(500).json({ error: "Failed to create category" });
    }
};

// Update category (admin only)
export const updateCategory = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ error: "Category name is required" });
        }

        // Check if another category already has this name
        const existingCategory = await prisma.category.findFirst({
            where: {
                id: { not: id },
                name: {
                    equals: name.trim(),
                    mode: 'insensitive'
                }
            }
        });

        if (existingCategory) {
            return res.status(400).json({ error: "Another category with this name already exists" });
        }

        const category = await prisma.category.update({
            where: { id },
            data: {
                name: name.trim(),
                description: description?.trim()
            },
            include: {
                _count: {
                    select: { menuItems: true }
                }
            }
        });

        res.json(category);
    } catch (error) {
        console.error("Update Category Error:", error);
        res.status(500).json({ error: "Failed to update category" });
    }
};

// Delete category (admin only)
export const deleteCategory = async (req: any, res: Response) => {
    try {
        const { id } = req.params;

        // Check if category has menu items
        const categoryWithItems = await prisma.category.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { menuItems: true }
                }
            }
        });

        if (!categoryWithItems) {
            return res.status(404).json({ error: "Category not found" });
        }

        if (categoryWithItems._count.menuItems > 0) {
            return res.status(400).json({ 
                error: "Cannot delete category with menu items. Move or delete items first." 
            });
        }

        await prisma.category.delete({
            where: { id }
        });

        res.json({ message: "Category deleted successfully" });
    } catch (error) {
        console.error("Delete Category Error:", error);
        res.status(500).json({ error: "Failed to delete category" });
    }
};

// ========== DASHBOARD STATS ==========

// Get dashboard statistics (admin only)
export const getDashboardStats = async (req: any, res: Response) => {
    try {
        const today = new Date();
        const startOfToday = new Date(today.setHours(0, 0, 0, 0));
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        const [
            totalOrders,
            todayOrders,
            totalRevenue,
            todayRevenue,
            totalUsers,
            totalMenuItems,
            pendingOrders,
            popularItems
        ] = await Promise.all([
            // Total orders
            prisma.order.count(),
            
            // Today's orders
            prisma.order.count({
                where: {
                    createdAt: {
                        gte: startOfToday
                    }
                }
            }),
            
            // Total revenue
            prisma.order.aggregate({
                _sum: { totalAmount: true }
            }),
            
            // Today's revenue
            prisma.order.aggregate({
                where: {
                    createdAt: {
                        gte: startOfToday
                    }
                },
                _sum: { totalAmount: true }
            }),
            
            // Total users
            prisma.user.count(),
            
            // Total menu items
            prisma.menuItem.count(),
            
            // Pending orders
            prisma.order.count({
                where: { orderStatus: 'pending' }
            }),
            
            // Popular items (top 5)
            prisma.orderItem.groupBy({
                by: ['menuItemId'],
                _sum: { quantity: true },
                orderBy: {
                    _sum: {
                        quantity: 'desc'
                    }
                },
                take: 5
            })
        ]);

        res.json({
            stats: {
                totalOrders,
                todayOrders,
                totalRevenue: totalRevenue._sum.totalAmount || 0,
                todayRevenue: todayRevenue._sum.totalAmount || 0,
                totalUsers,
                totalMenuItems,
                pendingOrders,
            },
            popularItems
        });
    } catch (error) {
        console.error("Get Dashboard Stats Error:", error);
        res.status(500).json({ error: "Failed to fetch dashboard statistics" });
    }
};


// get users
export const getAllUsers = async (req: any, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        _count: {
          select: {
            orders: true,
            addresses: true,
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json(users);
  } catch (error) {
    console.error("Get All Users Error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const updateUserRole = async (req: any, res: Response) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const validRoles = ["user", "admin"];
    
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      }
    });

    res.json({ 
      message: "User role updated successfully", 
      user 
    });
  } catch (error) {
    console.error("Update User Role Error:", error);
    res.status(500).json({ error: "Failed to update user role" });
  }
};

