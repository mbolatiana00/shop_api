import { Router } from "express";
import { restaurantController } from "../controller/RestaurantsController";

const router = Router()

router.get('/categories', restaurantController.getCategories);
router.get('/menu/all',   restaurantController.getAllMenuItems);
router.get('/',       restaurantController.getAllRestaurants);
router.get('/:id',        restaurantController.getRestaurantId);
router.get('/:id/menu',   restaurantController.getAllMenuItems);

export default router;