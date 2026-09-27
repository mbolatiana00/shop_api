"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restaurantController = void 0;
const restaurants_service_1 = require("../service/restaurants.service");
exports.restaurantController = {
    getAllRestaurants: async (request, response) => {
        try {
            const page = parseInt(request.query.page) || 1;
            const limit = parseInt(request.query.page) || 20;
            const search = request.query.search;
            const result = await restaurants_service_1.restaurantService.getAllRestaurants(page, limit, search);
            response.json({ success: true, ...result });
        }
        catch (error) {
            response.status(500).json({ success: false, message: error.message });
        }
    },
    getRestaurantId: async (request, response) => {
        try {
            const id = parseInt(request.params.id);
            const restaurant = await restaurants_service_1.restaurantService.getRestaurantById(id);
            response.json({ success: true, restaurant });
        }
        catch (error) {
            response.status(404).json({ success: false, message: error.message });
        }
    },
    getAllMenuItems: async (request, response) => {
        try {
            const page = parseInt(request.query.page) || 1;
            const limit = parseInt(request.query.limit) || 20;
            const category = request.query.category;
            const search = request.query.search;
            const result = await restaurants_service_1.restaurantService.getAllMenuItems(page, limit, category, search);
            response.json({ success: true, ...result });
        }
        catch (error) {
            response.status(500).json({ success: false, message: error.message });
        }
    },
    getCategories: async (request, response) => {
        try {
            const categories = await restaurants_service_1.restaurantService.getCategories();
            response.json({ success: true, categories });
        }
        catch (error) {
            response.status(500).json({ success: false, message: error.message });
        }
    },
};
