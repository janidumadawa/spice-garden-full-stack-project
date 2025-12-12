import { api } from "./api";

export interface PlaceOrderData {
  address: string;
  paymentStatus?: string;
  promoCodeId?: string;
}

export interface OrderItem {
  id: string;
  menuItem: {
    id: string;
    name: string;
    basePrice: number;
    imageUrl?: string;
  };
  quantity: number;
  price: number;
  optionIds: string;
}

export interface Order {
  id: string;
  userId: string;
  totalAmount: number;
  tax: number;
  deliveryFee: number;
  paymentStatus: string;
  orderStatus: string;
  promoCodeId: string | null;
  address: string;
  createdAt: string;
  items: OrderItem[];
}

export const orderApi = {
  placeOrder: async (data: PlaceOrderData) => {
    const response = await api.post("/orders", data);
    return response.data;
  },
  
  getOrderDetails: async (orderId: string) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },
  
  getUserOrders: async (): Promise<Order[]> => {
    const response = await api.get("/orders/user/current");
    return response.data;
  }
};