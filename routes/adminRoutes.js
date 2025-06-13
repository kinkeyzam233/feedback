const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware'); // your admin auth middleware

// Admin dashboard - protected route
router.get('/landing_admin', authMiddleware.isAdmin, adminController.getDashboard);

// View all feedbacks - protected route
router.get('/feedbacks', authMiddleware.isAdmin, adminController.viewAllFeedback);

// Admin logout - protected route
router.post('/logout', authMiddleware.isAdmin, adminController.postLogout);

module.exports = router;
