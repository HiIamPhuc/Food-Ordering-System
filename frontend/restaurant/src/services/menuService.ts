import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const menuService = {
  // Get all menu items
  getAllMenuItems: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/menu`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get menu item by ID
  getMenuItemById: async (id: string) => {
    try {
      const response = await axios.get(`${API_URL}/api/menu/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new menu item
  createMenuItem: async (menuItem: any) => {
    try {
      const response = await axios.post(`${API_URL}/api/menu`, menuItem);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update menu item
  updateMenuItem: async (id: string, menuItem: any) => {
    try {
      const response = await axios.put(`${API_URL}/api/menu/${id}`, menuItem);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete menu item
  deleteMenuItem: async (id: string) => {
    try {
      const response = await axios.delete(`${API_URL}/api/menu/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default menuService; 