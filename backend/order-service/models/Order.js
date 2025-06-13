const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const orderSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4
  },
  user_id: {
    type: String,
    required: [true, 'User ID is required'],
    trim: true
  },
  menu_item_id: {
    type: String,
    required: [true, 'Menu item ID is required'],
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    validate: {
      validator: function(value) {
        return Number.isInteger(value) && value > 0;
      },
      message: 'Quantity must be a positive integer'
    }
  },
  total_price: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Total price cannot be negative'],
    validate: {
      validator: function(value) {
        return Number.isFinite(value) && value >= 0;
      },
      message: 'Total price must be a valid positive number'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
    default: 'pending',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'orders'
});

// Index for better query performance
orderSchema.index({ user_id: 1 });
orderSchema.index({ menu_item_id: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ created_at: -1 });
orderSchema.index({ user_id: 1, status: 1 });

// Virtual for formatted total price
orderSchema.virtual('formatted_total_price').get(function() {
  return `$${this.total_price.toFixed(2)}`;
});

// Method to update status
orderSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  this.updated_at = new Date();
  return this.save();
};

// Static method to find orders by user
orderSchema.statics.findByUser = function(userId) {
  return this.find({ user_id: userId }).sort({ created_at: -1 });
};

// Static method to find orders by status
orderSchema.statics.findByStatus = function(status) {
  return this.find({ status: status }).sort({ created_at: -1 });
};

// Static method to get order statistics
orderSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalValue: { $sum: '$total_price' }
      }
    }
  ]);
  
  const totalOrders = await this.countDocuments();
  const totalRevenue = await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: '$total_price' }
      }
    }
  ]);

  return {
    totalOrders,
    totalRevenue: totalRevenue[0]?.total || 0,
    statusBreakdown: stats
  };
};

// Pre-save middleware to update the updated_at field
orderSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Transform output
orderSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;