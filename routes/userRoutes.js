const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/authMiddleware');
const db = require('../config/db');
const { ensureAuthenticated } = require('../middleware/authMiddleware');

// Dashboard home
router.get('/home', requireAuth, userController.showHome);

// Feedback form and submission
router.get('/feedback', requireAuth, userController.showFeedbackForm);
router.post('/feedback', requireAuth, userController.submitFeedback);

// View feedback
router.get('/my-feedback', requireAuth, userController.viewMyFeedback);

// Delete feedback
router.post('/my-feedback/delete/:id', requireAuth, userController.deleteFeedback);

router.get('/feedback/edit/:id', ensureAuthenticated, userController.getEditFeedbackForm);
router.post('/feedback/edit/:id', ensureAuthenticated, userController.updateFeedback);

module.exports = router;
