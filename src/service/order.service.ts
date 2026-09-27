import { OrderStatus } from "../generated/prisma/enums"
import { prisma } from "../lib/prisma"


interface createOrderData{
    userId : number,
    restaurantId : number,
    pickupAddress : string,
    deliveryAddress : string,
    price : number
}


export const createOrder = async (data: createOrderData) =>{
    return prisma.order.create({
        data : {
            userId : data.userId,
            restaurantId : data.restaurantId,
            pickupAddress : data.pickupAddress,
            deliveryAddress : data.deliveryAddress,
            totalPrice : data.price
        },
        include : {
            user : {
                select : {id : true, name : true, email : true, phone :true}
            }
        }
    })
}

export const getAllOrders = async (status?: OrderStatus) =>{

    const where = status ? {status} : {}

    return prisma.order.findMany({
        where,
        include : {
            user : {
                select : {id : true, name: true, email: true, phone: true}
            },
            delivery : {
                include :{
                    driver : {
                        include : {
                             user : {select : {id: true, name: true, phone:true}},
                             vehicle: true,
                        },
                       
                    },
                },
            },
            payment : true,
        },
        orderBy : {createdAt : "asc"}
    })

}

export const getUserOrders = async (userId: number) => {
  return prisma.order.findMany({
    where: { userId },
    include: {
      delivery: {
        include: {
          driver: {
            include: {
              user: { select: { id: true, name: true, phone: true } },
              vehicle: true,
            },
          },
        },
      },
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getOrderById = async (id: number) => {
  return prisma.order.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, email: true, phone: true },
      },
      delivery: {
        include: {
          driver: {
            include: {
              user: { select: { id: true, name: true, phone: true } },
              vehicle: true,
            },
          },
          tracking: {
            orderBy: { createdAt: "desc" },
          },
        },
      },
      payment: true,
    },
  });
};

export const updateOrderStatus = async (orderId: number, status: OrderStatus) => {
  return prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: {
      user: {
        select: { id: true, name: true, email: true, phone: true },
      },
      delivery: true,
    },
  });
};

export const cancelOrder = async (orderId: number) => {
  return prisma.order.update({
    where: { id: orderId },
    data: { status: OrderStatus.CANCELED },
  });
};