const pgp = require('pg-promise')();  // <--- You are missing this line!
require('dotenv').config();

const db = pgp({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'Feedback-system',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'kinleyzam',
  // ssl: {
  //   rejectUnauthorized: false
  // }
 });

module.exports = db;