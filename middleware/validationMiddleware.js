// Example validation middleware (adjust as needed)
exports.validateRegisterInput = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || !email || !password) {
    errors.push('All fields are required.');
  }

  // Add more validation rules as needed...

  if (errors.length > 0) {
    req.session.error = errors.join(' ');
    return res.redirect('/register');
  }

  next();
};

exports.validateLoginInput = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    req.session.error = 'Email and password are required.';
    return res.redirect('/login');
  }
  next();
};
exports.validateFeedback = (req, res, next) => {
  const { rating, comments } = req.body;

  const errors = [];

  if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
    errors.push('Rating must be a number between 1 and 5.');
  }

  if (!comments || comments.trim().length < 5) {
    errors.push('Comments must be at least 5 characters long.');
  }

  if (errors.length > 0) {
    req.session.error = errors.join(' ');
    return res.redirect('back'); // Redirects to the form page
  }

  next();
};
