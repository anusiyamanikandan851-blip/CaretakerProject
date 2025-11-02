const express = require('express');
const router = express.Router();

// Placeholder caretaker routes
router.get('/', (req, res) => {
	res.json({ success: true, message: 'Caretaker routes placeholder' });
});

module.exports = router;
