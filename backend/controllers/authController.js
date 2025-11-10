exports.signup = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    // Temporary stub for testing
    return res.json({
      success: true,
      message: 'Signup successful!',
      token: 'sample-token',
      user: { name, email, phone, address }
    });
  } catch (err) {
    console.error('authController.signup error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    return res.json({
      success: true,
      message: 'Signin successful!',
      token: 'sample-token',
      user: { name: 'Test User', email }
    });
  } catch (err) {
    console.error('authController.signin error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getProfile = async (req, res) => {
  return res.json({
    success: true,
    user: { id: '1', name: 'Stub User', email: 'stub@example.com' }
  });
};
