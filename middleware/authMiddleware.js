function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
}

function isStudent(req, res, next) {
  if (req.session.user && req.session.user.role === 'student') {
    return next();
  }
  return res.status(403).send('Forbidden');
}

function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === 'admin') {
    next();
  } else {
    res.redirect('/login');
  }
}
// middleware/auth.js
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.redirect('/edit_feedback');
}

function ensureAuthenticated(req, res, next) {
  console.log('Session:', req.session);
  console.log('User:', req.user);

  if (req.isAuthenticated && req.isAuthenticated()) {
    console.log('User is authenticated');
    return next();
  }

  console.log('User is NOT authenticated');
  res.redirect('/login');
}



module.exports = {
  requireAuth,
  isStudent,
  isAdmin,
  ensureAuthenticated 
};
