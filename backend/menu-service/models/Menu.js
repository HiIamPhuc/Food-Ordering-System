const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const menuSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4
  },
  name: {
    type: String,
    required: [true, 'Menu item name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters'],
    minlength: [1, 'Name must be at least 1 character']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    validate: {
      validator: function(value) {
        return Number.isFinite(value) && value >= 0;
      },
      message: 'Price must be a valid positive number'
    }
  },
  image_url: {
    type: String,
    trim: true,
    validate: {
      validator: function(value) {
        if (!value) return true; // Optional field
        const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
        return urlRegex.test(value);
      },
      message: 'Please provide a valid image URL'
    }
  },
  status: {
    type: Boolean,
    default: true,
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
  collection: 'menu'
});

// Index for better query performance
menuSchema.index({ name: 'text' });
menuSchema.index({ status: 1 });
menuSchema.index({ price: 1 });
menuSchema.index({ created_at: -1 });

// Virtual for formatted price
menuSchema.virtual('formatted_price').get(function() {
  return `$${this.price.toFixed(2)}`;
});

// Method to toggle status
menuSchema.methods.toggleStatus = function() {
  this.status = !this.status;
  return this.save();
};

// Static method to find available items
menuSchema.statics.findAvailable = function() {
  return this.find({ status: true }).sort({ name: 1 });
};

// Static method to search by name
menuSchema.statics.searchByName = function(query) {
  return this.find({
    name: { $regex: query, $options: 'i' }
  }).sort({ name: 1 });
};

// Pre-save middleware to update the updated_at field
menuSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Transform output
menuSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const Menu = mongoose.model('Menu', menuSchema);

module.exports = Menu;