// Minimal auth controller stubs to allow route mounting and basic manual testing.
// These are intentionally lightweight placeholders. Replace with full
// implementations that use your User model and proper validation/auth in production.

exports.signup = async (req, res) => {
  try {
    // simple validation fallback
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'name, email and password are required' });
    }

    // Stubbed response — in a real app you'd create the user in MongoDB here.
    return res.json({ success: true, message: 'signup (stub) - user created', user: { name, email } });
  } catch (err) {
    console.error('authController.signup error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'email and password are required' });
    }

    // Stubbed authentication — replace with real credential check.
    return res.json({ success: true, message: 'signin (stub) - authenticated', token: 'stub-token' });
  } catch (err) {
    console.error('authController.signin error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    // If an auth middleware populates req.user, return it. Otherwise return a stub.
    const user = req.user || { id: 'stub-id', name: 'Stub User', email: 'stub@example.com' };
    return res.json({ success: true, user });
  } catch (err) {
    console.error('authController.getProfile error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
