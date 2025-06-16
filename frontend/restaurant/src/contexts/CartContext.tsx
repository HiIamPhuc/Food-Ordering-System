import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import axios from 'axios';

export interface CartItem {
  id: string; // Order ID
  menu_item_id: string; // Menu item ID
  name: string;
  price: number;
  image: string;
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
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.menu_item_id === action.payload.item.menu_item_id);
      
      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.menu_item_id === action.payload.item.menu_item_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        return {
          items: updatedItems,
          total: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        };
      }
      
      const newItems = [
        ...state.items,
        { ...action.payload.item, id: action.payload.orderId, quantity: 1 }
      ];
      return {
        items: newItems,
        total: newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      };
    }
    
    case 'UPDATE_QUANTITY': {
      const updatedItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: Math.max(0, action.payload.quantity) }
          : item
      ).filter(item => item.quantity > 0);
      
      return {
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      };
    }
    
    case 'REMOVE_ITEM': {
      const filteredItems = state.items.filter(item => item.id !== action.payload.id);
      return {
        items: filteredItems,
        total: filteredItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      };
    }
    
    case 'CLEAR_CART':
      return { items: [], total: 0 };
    
    default:
      return state;
  }
};

interface CartContextType {
  state: CartState;
  addItem: (item: Omit<CartItem, 'quantity' | 'id'>) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  setCart: (items: CartItem[]) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0 });
  const token = localStorage.getItem('token') || '';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api/orders';

  const addItem = async (item: Omit<CartItem, 'quantity' | 'id'>) => {
    try {
      const response = await axios.post(
        API_URL,
        {
          user_id: localStorage.getItem('userId') || 'user123',
          menu_item_id: item.menu_item_id,
          quantity: 1,
          total_price: item.price
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch({ 
        type: 'ADD_ITEM', 
        payload: { item, orderId: response.data.data.id }
      });
    } catch (error) {
      throw new Error('Unable to add item to cart');
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const removeItem = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      dispatch({ type: 'REMOVE_ITEM', payload: { id } });
    } catch (error) {
      throw new Error('Unable to remove item from cart');
    }
  };

  const clearCart = async () => {
    try {
      const response = await axios.get(`${API_URL}/user/${localStorage.getItem('userId') || 'user123'}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const orders = response.data.data.filter(order => order.status === 'pending');
      await Promise.all(
        orders.map(order => 
          axios.delete(`${API_URL}/${order.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        )
      );
      dispatch({ type: 'CLEAR_CART' });
    } catch (error) {
      throw new Error('Unable to clear cart');
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