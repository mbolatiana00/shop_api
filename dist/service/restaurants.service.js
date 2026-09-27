"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restaurantService = void 0;
const prisma_1 = require("../lib/prisma");
exports.restaurantService = {
    ///resto afficher complet avec pagination de 20 
    getAllRestaurants: async (page = 1, limit = 20, search) => {
        const skip = (page - 1) * limit;
        const where = search ? { name: { contains: search } } : {};
        //charger tous 
        const [restaurants, total] = await Promise.all([
            prisma_1.prisma.restaurant.findMany({
                where,
                skip,
                take: limit,
                orderBy: { name: "asc" }
            }),
            prisma_1.prisma.restaurant.count({ where })
        ]);
        return {
            restaurants,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    },
    getRestaurantById: async (id) => {
        const restaurant = await prisma_1.prisma.restaurant.findUnique({
            where: { id },
            include: {
                menuItems: {
                    where: { isAvailable: true },
                    orderBy: { category: 'asc' },
                },
            },
        });
        if (!restaurant)
            throw new Error("Restaurant introuvable");
        return restaurant;
    },
    getMenuItemsByRestaurant: async (restaurantId, page = 1, limit = 20, category) => {
        const skip = (page - 1) * 20;
        const where = { restaurantId, isAvailable: true };
        if (category && category !== 'tout') {
            where.category = category;
        }
        const [menuItems, total] = await Promise.all([
            prisma_1.prisma.menuItem.findMany({
                where,
                skip,
                take: limit,
                orderBy: { category: 'asc' }
            }),
            prisma_1.prisma.menuItem.count({ where })
        ]);
        return {
            menuItems,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    },
    getAllMenuItems: async (page = 1, limit = 20, category, search) => {
        const skip = (page - 1) * 20;
        const where = { isAvailable: true };
        if (category && category !== 'tout') {
            where.category = category;
        }
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { description: { contains: search } },
                { restaurant: { name: { contains: search } } }
            ];
        }
        const [menuItems, total] = await Promise.all([
            prisma_1.prisma.menuItem.findMany({
                where,
                skip,
                take: limit,
                include: {
                    restaurant: {
                        select: { id: true, name: true, imageUrl: true, isOpen: true },
                    },
                },
                orderBy: { name: 'asc' }
            }),
            prisma_1.prisma.menuItem.count({ where })
        ]);
        return {
            menuItems,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    },
    //category []
    getCategories: async () => {
        const cats = await prisma_1.prisma.menuItem.findMany({
            select: { category: true },
            distinct: ['category'],
            orderBy: { category: 'asc' }
        });
        return ['tout', ...cats.map((c) => c.category)];
    }
};
