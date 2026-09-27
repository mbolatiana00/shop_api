import {prisma} from "../lib/prisma"

export const restaurantService = {

    ///resto afficher complet avec pagination de 20 

    getAllRestaurants : async (page = 1 , limit = 20, search?: string) =>{

        const skip = (page - 1) * limit

        const where = search ? {name : {contains : search}} : {}
            //charger tous 
        const [restaurants, total] = await Promise.all([
            prisma.restaurant.findMany({
                where,
                skip,
                take : limit,
                orderBy : {name : "asc"}
            }),
            prisma.restaurant.count({where})
        ])
        return {
            restaurants,
            total,
            page,
            totalPages : Math.ceil(total / limit)
        }

    },

    getRestaurantById : async (id : number) =>{
        const restaurant = await prisma.restaurant.findUnique({
            where : {id},
            include :{
                menuItems : {
                    where : {isAvailable : true},
                    orderBy : {category  : 'asc'  },

                },
            },
        });
        if(!restaurant) throw new Error("Restaurant introuvable");
        return restaurant
    }, 
    getMenuItemsByRestaurant : async (restaurantId : number, page = 1, limit = 20, category?: string)=>{
        const skip = (page - 1) * 20

        const where : any = {restaurantId, isAvailable : true}

        if(category && category !== 'tout'){
            where.category = category
        }

        const [menuItems, total] = await Promise.all([
            prisma.menuItem.findMany({
                where,
                skip,
                take : limit,
                orderBy : {category : 'asc'}
            }),
            prisma.menuItem.count({ where})
        ]);
        return {
            menuItems,
            total,
            page,
            totalPages : Math.ceil(total / limit)
        }
    },

    getAllMenuItems : async (page = 1, limit = 20, category?: string, search?:string) =>{
        const skip = (page - 1) * 20
        const where : any = {isAvailable : true}
        if(category && category !== 'tout'){
            where.category = category
        }
        if (search) {
            where.OR = [
                {name: {contains : search}},
                {description : {contains : search}},
                {restaurant : {name : {contains : search}}}
            ]
        }
        const [menuItems, total] = await Promise.all([
            prisma.menuItem.findMany({
                where,
                skip,
                take :limit,
                include : {
                    restaurant : {
                        select : {id :true, name : true, imageUrl : true, isOpen : true},
                    },
               },
               orderBy : {name : 'asc'}
            }),
            prisma.menuItem.count({where})
        ]);

        return {
            menuItems,
            total,
            page,
            totalPages  : Math.ceil(total / limit)
        }
    },
//category []
    getCategories : async () =>{
        const cats = await prisma.menuItem.findMany({
            select : {category : true},
            distinct : ['category'],
            orderBy : {category : 'asc'}
        });
        return ['tout', ...cats.map((c : {category : string | null}) => c.category)]
    }


}