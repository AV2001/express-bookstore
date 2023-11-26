process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let bookData;

beforeEach(async () => {
    let result = await db.query(
        `
        INSERT INTO books (isbn, amazon_url, author, language, pages, publisher, title, year)
        VALUES ('123-4567890123', 'http://www.amazon.com/example-book', 'Jane Doe', 'English', 300, 'Example Publisher', 'Example Book Title', 2021)
        RETURNING *
        `
    );
    bookData = result.rows[0];
});

afterEach(async () => {
    await db.query('DELETE FROM books;');
});

afterAll(async () => {
    await db.end();
});

describe('GET /books', () => {
    test('Get all books', async () => {
        const response = await request(app).get('/books');
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ books: [bookData] });
    });
});

describe('GET /books/:id', () => {
    test('Get a book', async () => {
        const response = await request(app).get(`/books/${bookData.isbn}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ book: bookData });
    });

    test('Return 404 if invalid id is passed', async () => {
        const response = await request(app).get('/books/1234567890');
        expect(response.statusCode).toBe(404);
    });
});
