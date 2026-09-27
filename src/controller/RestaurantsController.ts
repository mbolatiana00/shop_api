import { Request, Response } from "express";
import { restaurantService } from "../service/restaurants.service";


export const restaurantController = {

    getAllRestaurants : async(request : Request, response : Response) =>{

        try{
            const page = parseInt(request.query.page as string) || 1
            const limit = parseInt(request.query.page as string) || 20
            const search = request.query.search as string | undefined

            const result = await restaurantService.getAllRestaurants(page, limit, search)
            response.json({success : true, ...result})

        }catch(error : any){
            response.status(500).json({success : false, message : error.message})
        }
    },


    getRestaurantId : async(request : Request, response : Response) =>{
        try{
            const id = parseInt(request.params.id)
            const restaurant = await restaurantService.getRestaurantById(id)
            response.json({success : true, restaurant})
        }catch(error : any){
            response.status(404).json({success : false, message : error.message})
        }
    },

    getAllMenuItems: async (request: Request, response: Response) => {
        try {
          const page     = parseInt(request.query.page as string)   || 1;
          const limit    = parseInt(request.query.limit as string)  || 20;
          const category = request.query.category as string | undefined;
          const search   = request.query.search   as string | undefined;
    
          const result = await restaurantService.getAllMenuItems(page, limit, category, search);
          response.json({ success: true, ...result });
        } catch (error: any) {
          response.status(500).json({ success: false, message: error.message });
        }
      },
    
      getCategories: async (request: Request, response: Response) => {
        try {
          const categories = await restaurantService.getCategories();
          response.json({ success: true, categories });
        } catch (error: any) {
          response.status(500).json({ success: false, message: error.message });
        }
      },
}