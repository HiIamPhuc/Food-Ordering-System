const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'No token provided'
      });
    }

    // For development, we'll use a simple JWT verification
    // In production, this should verify against the User service
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Please login again'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Token is malformed'
      });
    }
    
    res.status(401).json({
      error: 'Authentication failed',
      message: 'Invalid token'
    });
  }
};

// Middleware for optional authentication
const optionalAuth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
      req.user = decoded;
    }
    
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

module.exports = auth;
module.exports.optionalAuth = optionalAuth;