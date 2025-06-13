const { db } = require('../config/db');

const User = {
  // Find user by email
  async findUserByEmail(email) {
    return db.oneOrNone(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );
  },

  // Find user by ID
  async findUserById(id) {
    return db.oneOrNone(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
  },

  // Create a new user
  async createUser({ email, password, firstName, lastName, role }) {
    return db.one(
      `INSERT INTO users (email, password, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, first_name, last_name, role`,
      [email, password, firstName, lastName, role]
    );
  },

  // Update user password
  async updatePassword(id, hashedPassword) {
    return db.none(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashedPassword, id]
    );
  }
};

module.exports = User;
