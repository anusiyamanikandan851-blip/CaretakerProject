// Minimal auth middleware stub. In production replace with JWT verification
// and user lookup (e.g., verify token and populate req.user).
module.exports = function (req, res, next) {
  // If an Authorization header exists we could parse it here.
  // For now this is a passthrough so protected routes can be reached
  // during development without a full auth implementation.
  try {
    // Optionally attach a stub user for testing
    req.user = req.user || { id: 'stub-id', name: 'Stub User', email: 'stub@example.com' };
    return next();
  } catch (err) {
    console.error('auth middleware error:', err);
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
};
