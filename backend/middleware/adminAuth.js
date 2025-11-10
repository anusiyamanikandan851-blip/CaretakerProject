// Middleware to check if user is admin
module.exports = function (req, res, next) {
  try {
    // Check if user exists (should be set by auth middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
      });
    }

    next();
  } catch (err) {
    console.error('Admin auth middleware error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
