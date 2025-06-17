const axios = require('axios');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied',
        message: 'No token provided'
      });
    }

    // Gọi user service để xác minh token
    const response = await axios.get(`${process.env.USER_SERVICE_URL || 'http://localhost:8000'}/api/users/profile/`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // Lưu thông tin user vào req.user
    req.user = response.data; // { id, name, email, username, created_at }
    next();
  } catch (error) {
    if (error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: 'Please login again'
      });
    }
    
    console.error('Auth error:', error.message);
    res.status(401).json({
      success: false,
      error: 'Authentication failed',
      message: 'Invalid token'
    });
  }
};

// Middleware cho xác thực tùy chọn
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const response = await axios.get(`${process.env.USER_SERVICE_URL || 'http://localhost:8000'}/api/users/profile/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      req.user = response.data;
    }
    
    next();
  } catch (error) {
    // Tiếp tục nếu token không hợp lệ
    next();
  }
};

module.exports = auth;
module.exports.optionalAuth = optionalAuth;