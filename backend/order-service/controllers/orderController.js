const { validationResult } = require('express-validator');
const Order = require('../models/Order');
const axios = require('axios');

// Helper function to verify menu item exists
const verifyMenuItem = async (menuItemId) => {
  try {
    const response = await axios.get(`${process.env.MENU_SERVICE_URL || 'http://localhost:3001'}/api/menu/${menuItemId}`);
    return response.data.success ? response.data.data : null;
  } catch (error) {
    console.error('Error verifying menu item:', error.message);
    return null;
  }
};

// Create new order
const createOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    // Verify menu item exists and is available
    const menuItem = await verifyMenuItem(req.body.menu_item_id);
    if (!menuItem) {
      return res.status(400).json({
        success: false,
        error: 'Menu item not found or unavailable'
      });
    }

    // Calculate expected total price
    const expectedTotal = menuItem.price * req.body.quantity;
    if (Math.abs(expectedTotal - req.body.total_price) > 0.01) {
      return res.status(400).json({
        success: false,
        error: 'Total price mismatch',
        expected: expectedTotal,
        received: req.body.total_price
      });
    }

    const order = new Order(req.body);
    await order.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create order',
      message: error.message
    });
  }
};

// Get all orders with pagination
const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || 'created_at';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const orders = await Order.find()
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments();

    res.status(200).json({
      success: true,
      data: orders,
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
      error: 'Failed to fetch orders',
      message: error.message
    });
  }
};

// Get orders by user ID
const getOrdersByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const orders = await Order.findByUser(userId);

    res.status(200).json({
      success: true,
      data: orders,
      count: orders.length,
      user_id: userId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user orders',
      message: error.message
    });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order',
      message: error.message
    });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    await order.updateStatus(req.body.status);

    res.status(200).json({
      success: true,
      message: `Order status updated to ${req.body.status}`,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update order status',
      message: error.message
    });
  }
};

// Delete order
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete order',
      message: error.message
    });
  }
};

// Get orders by status
const getOrdersByStatus = async (req, res) => {
  try {
    const status = req.params.status;
    const orders = await Order.findByStatus(status);

    res.status(200).json({
      success: true,
      data: orders,
      count: orders.length,
      status: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders by status',
      message: error.message
    });
  }
};

// Bulk update order status
const bulkUpdateOrderStatus = async (req, res) => {
  try {
    const { order_ids, status } = req.body;
    
    if (!Array.isArray(order_ids) || order_ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Order IDs array is required and cannot be empty'
      });
    }

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status value'
      });
    }

    const result = await Order.updateMany(
      { _id: { $in: order_ids } },
      { status: status, updated_at: new Date() }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} orders updated successfully`,
      updated_count: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to bulk update orders',
      message: error.message
    });
  }
};

// Get order statistics
const getOrderStats = async (req, res) => {
  try {
    const stats = await Order.getStats();

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order statistics',
      message: error.message
    });
  }
};

// Get user-specific order statistics
const getUserOrderStats = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const userStats = await Order.aggregate([
      { $match: { user_id: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalSpent: { $sum: '$total_price' }
        }
      }
    ]);

    const totalOrders = await Order.countDocuments({ user_id: userId });
    const totalSpent = await Order.aggregate([
      { $match: { user_id: userId } },
      {
        $group: {
          _id: null,
          total: { $sum: '$total_price' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        user_id: userId,
        total_orders: totalOrders,
        total_spent: totalSpent[0]?.total || 0,
        status_breakdown: userStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user order statistics',
      message: error.message
    });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrdersByUser,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  getOrdersByStatus,
  bulkUpdateOrderStatus,
  getOrderStats,
  getUserOrderStats
};