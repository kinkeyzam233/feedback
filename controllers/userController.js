// const { 
//   addFeedback, 
//   getFeedbackByStudentId, 
//   deleteFeedback 
// } = require('../Models/feedbackModel');
const db = require('../config/db');
const { ensureAuthenticated } = require('../middleware/authMiddleware');

const courseOptions = [
  { id: 1, name: 'Web Development' },
  { id: 2, name: 'Data Structures' },
  { id: 3, name: 'Operating Systems' }
];

const moduleOptions = [
  { id: 1, name: 'HTML/CSS' },
  { id: 2, name: 'JavaScript' },
  { id: 3, name: 'Node.js' }
];

const categoryOptions = [
  { id: 1, name: 'Quality' },
  { id: 2, name: 'Difficulty' },
  { id: 3, name: 'Teaching' }
];

const courseNames = {
  1: 'Web Development',
  2: 'Data Structures',
  3: 'Operating Systems'
};

// Home Page
const showHome = (req, res) => {
  res.render('user/home', {
    user: req.session.user,
    message: req.flash('success')[0] || null,
    error: req.flash('error')[0] || null
  });
};

// Feedback Form
const showFeedbackForm = (req, res) => {
  res.render('user/feedback', {
    user: req.session.user,
    courseOptions,
    moduleOptions,
    categories: categoryOptions,
    formData: {},
    message: req.flash('success')[0] || null,
    error: req.flash('error')[0] || null
  });
};

// Submit Feedback
const submitFeedback = async (req, res) => {
  const {
    course_id, instructor_id, category_id, rating,
    comments, is_anonymous, semester, academic_year
  } = req.body;

  const email = req.session.user.email;

  try {
    const student = await db.oneOrNone('SELECT id, first_name, last_name FROM users WHERE email = $1', [email]);

    if (!student) {
      req.flash('error', 'User not found.');
      return res.redirect('/login');
    }

    const student_name = is_anonymous === 'true' ? 'Anonymous Student' : `${student.first_name} ${student.last_name}`;

    await db.none(
      `INSERT INTO feedback (
        student_id, course_id, instructor_id, category_id, rating,
        feedback_message, is_anonymous, semester, academic_year, student_name
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        student.id, course_id, instructor_id, category_id, parseInt(rating),
        comments, is_anonymous === 'true', semester, academic_year, student_name
      ]
    );

    req.flash('success', 'Feedback submitted successfully.');
    res.redirect('/user/feedback');
  } catch (err) {
    console.error('Feedback submit error:', err);
    req.flash('error', 'Failed to submit feedback.');
    res.redirect('/user/feedback');
  }
};

// View My Feedback
const viewMyFeedback = async (req, res) => {
  try {
    const email = req.session.user.email;

    const student = await db.oneOrNone('SELECT id FROM users WHERE email = $1', [email]);
    if (!student) {
      req.flash('error', 'User not found.');
      return res.redirect('/login');
    }

    const feedbacks = await db.any(
      'SELECT * FROM feedback WHERE student_id = $1 ORDER BY id DESC',
      [student.id]
    );

    feedbacks.forEach(fb => {
      fb.course_name = courseNames[fb.course_id] || 'Unknown Course';
    });

    res.render('user/my-feedback', {
      user: req.session.user,
      feedbacks,
      courseOptions,
      moduleOptions,
      categories: categoryOptions,
      formData: {},
      message: req.flash('success')[0] || null,
      error: req.flash('error')[0] || null
    });
  } catch (err) {
    console.error('Load feedback error:', err);
    req.flash('error', 'Could not load feedback.');
    res.redirect('/user/feedback');
  }
};

// GET Edit Feedback Form
const getEditFeedbackForm = async (req, res) => {
  try {
    const feedbackId = req.params.id;
    const feedback = await Feedback.findById(feedbackId);

    if (!feedback) {
      req.flash('error', 'Feedback not found');
      return res.redirect('/feedback/view');
    }

    // Check if logged-in user is the owner
    if (feedback.user.toString() !== req.user._id.toString()) {
      req.flash('error', 'Unauthorized access');
      return res.redirect('/feedback/view');
    }

    res.render('edit_feedback', {
      formData: feedback,
      courseOptions: await getCourses(),
      moduleOptions: await getModules(),
      categories: await getCategories(),
      message: req.flash('success'),
      error: req.flash('error')
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Server error');
    res.redirect('/feedback/view');
  }
};


// POST Update Feedback
const updateFeedback = async (req, res) => {
  try {
    const feedbackId = req.params.id;

    // Check ownership of feedback before update
    const feedback = await db.oneOrNone(
      'SELECT * FROM feedback WHERE id = $1 AND student_id = $2',
      [feedbackId, req.session.user.id]
    );

    if (!feedback) {
      req.flash('error', 'Feedback not found or unauthorized.');
      return res.redirect('/user/my-feedback');
    }

    await db.none(
      `UPDATE feedback SET
        course_id = $1, instructor_id = $2, category_id = $3, rating = $4,
        feedback_message = $5, is_anonymous = $6, semester = $7, academic_year = $8
      WHERE id = $9`,
      [
        req.body.course_id,
        req.body.instructor_id,
        req.body.category_id,
        req.body.rating,
        req.body.comments,
        req.body.is_anonymous === 'true',
        req.body.semester,
        req.body.academic_year,
        feedbackId
      ]
    );

    req.flash('success', 'Feedback updated successfully.');
    res.redirect('/user/my-feedback');
  } catch (error) {
    console.error('Update error:', error);
    req.flash('error', 'Error updating feedback.');
    res.redirect('/user/my-feedback');
  }
};

// Delete Feedback
const deleteFeedback = async (req, res) => {
  try {
    await db.none('DELETE FROM feedback WHERE id = $1 AND student_id = $2', [
      req.params.id,
      req.session.user.id,
    ]);
    req.flash('success', 'Feedback deleted successfully.');
  } catch (err) {
    console.error('Delete error:', err);
    req.flash('error', 'Could not delete feedback.');
  }
  res.redirect('/user/my-feedback');
};

module.exports = {
  showHome,
  showFeedbackForm,
  submitFeedback,
  viewMyFeedback,
  deleteFeedback,
  getEditFeedbackForm,
  updateFeedback,
};
