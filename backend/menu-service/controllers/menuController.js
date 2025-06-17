const { validationResult } = require('express-validator');
const Menu = require('../models/Menu');

// Get all menu items
const getAllMenuItems = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || 'name';
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;

    const menuItems = await Menu.find()
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    const total = await Menu.countDocuments();

    res.status(200).json({
      success: true,
      data: menuItems,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_items: total,
        items_per_page: limit
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch menu items',
      message: error.message
    });
  }
};

// Get available menu items only
const getAvailableMenuItems = async (req, res) => {
  try {
    const menuItems = await Menu.findAvailable();
    
    res.status(200).json({
      success: true,
      data: menuItems,
      count: menuItems.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch available menu items',
      message: error.message
    });
  }
};

// Get menu item by ID
const getMenuItemById = async (req, res) => {
  try {
    const menuItem = await Menu.findById(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        error: 'Menu item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch menu item',
      message: error.message
    });
  }
};

// Create new menu item
const createMenuItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const menuItem = new Menu(req.body);
    await menuItem.save();

    res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      data: menuItem
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        error: 'Menu item already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to create menu item',
        message: error.message
      });
    }
  }
};

// Update menu item
const updateMenuItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const menuItem = await Menu.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        error: 'Menu item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Menu item updated successfully',
      data: menuItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update menu item',
      message: error.message
    });
  }
};

// Toggle menu item status
const toggleMenuItemStatus = async (req, res) => {
  try {
    const menuItem = await Menu.findById(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        error: 'Menu item not found'
      });
    }

    await menuItem.toggleStatus();

    res.status(200).json({
      success: true,
      message: `Menu item ${menuItem.status ? 'enabled' : 'disabled'} successfully`,
      data: menuItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to toggle menu item status',
      message: error.message
    });
  }
};

// Delete menu item
const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await Menu.findByIdAndDelete(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        error: 'Menu item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete menu item',
      message: error.message
    });
  }
};

// Search menu items
const searchMenuItems = async (req, res) => {
  try {
    const query = req.params.query;
    const menuItems = await Menu.searchByName(query);

    res.status(200).json({
      success: true,
      data: menuItems,
      count: menuItems.length,
      query: query
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to search menu items',
      message: error.message
    });
  }
};

// Filter by price range
const filterByPriceRange = async (req, res) => {
  try {
    const minPrice = parseFloat(req.query.min) || 0;
    const maxPrice = parseFloat(req.query.max) || Number.MAX_VALUE;

    const menuItems = await Menu.find({
      price: { $gte: minPrice, $lte: maxPrice }
    }).sort({ price: 1 });

    res.status(200).json({
      success: true,
      data: menuItems,
      count: menuItems.length,
      filter: { min_price: minPrice, max_price: maxPrice }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to filter menu items',
      message: error.message
    });
  }
};

// Create bulk menu items
const createBulkMenuItems = async (req, res) => {
  try {
    const menuItems = req.body.items;
    
    if (!Array.isArray(menuItems) || menuItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Items array is required and cannot be empty'
      });
    }

    const createdItems = await Menu.insertMany(menuItems);

    res.status(201).json({
      success: true,
      message: `${createdItems.length} menu items created successfully`,
      data: createdItems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create bulk menu items',
      message: error.message
    });
  }
};

// Bulk update status
const bulkUpdateStatus = async (req, res) => {
  try {
    const { ids, status } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'IDs array is required and cannot be empty'
      });
    }

    const result = await Menu.updateMany(
      { _id: { $in: ids } },
      { status: status }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} menu items updated successfully`,
      updated_count: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to bulk update menu items',
      message: error.message
    });
  }
};

module.exports = {
  getAllMenuItems,
  getAvailableMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  toggleMenuItemStatus,
  deleteMenuItem,
  searchMenuItems,
  filterByPriceRange,
  createBulkMenuItems,
  bulkUpdateStatus
};