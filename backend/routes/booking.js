const express = require('express');
const router = express.Router();

// Placeholder booking routes
router.get('/', (req, res) => {
	res.json({ success: true, message: 'Booking routes placeholder' });
});

module.exports = router;
