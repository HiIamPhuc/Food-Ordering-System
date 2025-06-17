import { API_ENDPOINTS } from '@/config/api';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  status: boolean;
  created_at: string;
  updated_at: string;
}

export interface MenuResponse {
  success: boolean;
  data: MenuItem[];
  pagination?: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
}

export interface CreateMenuItemRequest {
  name: string;
  price: number;
  image_url?: string;
  status?: boolean;
}

class MenuService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_ENDPOINTS.MENU.BASE; // Correct base URL
  }

  async getAllMenuItems(page: number = 1, limit: number = 20): Promise<MenuResponse> {
    const response = await fetch(`${this.baseUrl}?page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch menu items: ${response.statusText}`);
    }
    return response.json();
  }

  async getAvailableMenuItems(): Promise<MenuResponse> {
    console.log('Fetching from:', `${this.baseUrl}/available`);
    const response = await fetch(`${this.baseUrl}/available`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch available menu items: ${response.status} - ${errorText}`);
    }
    return response.json();
  }

  async getMenuItemById(id: string): Promise<MenuItem> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch menu item: ${response.statusText}`);
    }
    const data = await response.json();
    return data.data;
  }

  async createMenuItem(item: CreateMenuItemRequest): Promise<MenuItem> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      },
      body: JSON.stringify(item)
    });
    if (!response.ok) {
      throw new Error(`Failed to create menu item: ${response.statusText}`);
    }
    const data = await response.json();
    return data.data;
  }

  async updateMenuItem(id: string, item: Partial<CreateMenuItemRequest>): Promise<MenuItem> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      },
      body: JSON.stringify(item)
    });
    if (!response.ok) {
      throw new Error(`Failed to update menu item: ${response.statusText}`);
    }
    const data = await response.json();
    return data.data;
  }

  async toggleMenuItemStatus(id: string): Promise<MenuItem> {
    const response = await fetch(`${this.baseUrl}/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to toggle menu item status: ${response.statusText}`);
    }
    const data = await response.json();
    return data.data;
  }

  async deleteMenuItem(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to delete menu item: ${response.statusText}`);
    }
  }

  async searchMenuItems(query: string): Promise<MenuResponse> {
    const response = await fetch(`${this.baseUrl}/search/${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error(`Failed to search menu items: ${response.statusText}`);
    }
    return response.json();
  }
}

export const menuService = new MenuService();