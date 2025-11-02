const express = require('express');
const router = express.Router();

// Placeholder admin routes — replace with real handlers as needed.
router.get('/', (req, res) => {
	res.json({ success: true, message: 'Admin routes placeholder' });
});

module.exports = router;
