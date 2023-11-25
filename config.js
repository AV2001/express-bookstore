/** Common config for bookstore. */

// Load environment variables from .env
require('dotenv').config();

let DB_URI = process.env.DATABASE_URL;

if (process.env.NODE_ENV === 'test') {
    DB_URI = `${DB_URI}/books-test`;
} else {
    DB_URI = `${DB_URI}/books`;
}

module.exports = { DB_URI };
