import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '@/config/api';

export interface CartItem {
  id: string; // Order ID
  menu_item_id: string; // Menu item ID
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  total: number;
}

type CartAction = 
  | { type: 'SET_CART'; payload: CartItem[] }
  | { type: 'ADD_ITEM'; payload: { item: Omit<CartItem, 'quantity' | 'id'>; orderId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'CLEAR_CART' };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_CART':
      return {
        items: action.payload,
        total: action.payload.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      };
    case 'ADD_ITEM':
      return {
        ...state,
        items: [...state.items, { ...action.payload.item, id: action.payload.orderId, quantity: 1 }],
        total: state.total + action.payload.item.price,
      };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ).filter(item => item.quantity > 0),
        total: state.items.reduce(
          (sum, item) =>
            sum + (item.id === action.payload.id
              ? item.price * action.payload.quantity
              : item.price * item.quantity),
          0
        ),
      };
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload.id),
        total: state.items.reduce(
          (sum, item) =>
            sum + (item.id !== action.payload.id ? item.price * item.quantity : 0),
          0
        ),
      };
    case 'CLEAR_CART':
      return {
        items: [],
        total: 0,
      };
    default:
      return state;
  }
};

interface CartContextType {
  state: CartState;
  addItem: (item: Omit<CartItem, 'quantity' | 'id'>) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  setCart: (items: CartItem[]) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0 });
  const token = localStorage.getItem('token') || '';

  const addItem = async (item: Omit<CartItem, 'quantity' | 'id'>) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User not logged in');
      }
      const response = await axios.post(
        API_ENDPOINTS.ORDER.BASE,
        {
          user_id: userId,
          menu_item_id: item.menu_item_id,
          quantity: 1,
          total_price: item.price
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.data.success) {
        throw new Error(response.data.error);
      }
      dispatch({ 
        type: 'ADD_ITEM', 
        payload: { item, orderId: response.data.data.id }
      });
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Unable to add item to cart');
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        return removeItem(id);
      }
      const item = state.items.find(item => item.id === id);
      if (!item) {
        throw new Error('Item not found');
      }
      const response = await axios.patch(
        API_ENDPOINTS.ORDER.ITEM(id),
        {
          quantity,
          total_price: item.price * quantity
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.data.success) {
        throw new Error(response.data.error);
      }
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Unable to update quantity');
    }
  };

  const removeItem = async (id: string) => {
    try {
      const response = await axios.delete(API_ENDPOINTS.ORDER.ITEM(id), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.data.success) {
        throw new Error(response.data.error);
      }
      dispatch({ type: 'REMOVE_ITEM', payload: { id } });
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Unable to remove item from cart');
    }
  };

  const clearCart = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User not logged in');
      }
      const response = await axios.get(API_ENDPOINTS.ORDER.USER(userId), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.data.success) {
        throw new Error(response.data.error);
      }
      const orders = response.data.data.filter(order => order.status === 'pending');
      await Promise.all(
        orders.map(order => 
          axios.delete(API_ENDPOINTS.ORDER.ITEM(order.id), {
            headers: { Authorization: `Bearer ${token}` }
          })
        )
      );
      dispatch({ type: 'CLEAR_CART' });
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Unable to clear cart');
    }
  };

  const setCart = (items: CartItem[]) => {
    dispatch({ type: 'SET_CART', payload: items });
  };

  return (
    <CartContext.Provider value={{ state, addItem, updateQuantity, removeItem, clearCart, setCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};