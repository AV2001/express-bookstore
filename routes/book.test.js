process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testBook;

beforeEach(async () => {
    let result = await db.query(
        `
        INSERT INTO books (isbn, amazon_url, author, language, pages, publisher, title, year)
        VALUES ('123-4567890123', 'http://www.amazon.com/example-book', 'Jane Doe', 'English', 300, 'Example Publisher', 'Example Book Title', 2021)
        RETURNING *
        `
    );
    testBook = result.rows[0];
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
        expect(response.body).toEqual({ books: [testBook] });
    });
});

describe('GET /books/:id', () => {
    test('Get a book', async () => {
        const response = await request(app).get(`/books/${testBook.isbn}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ book: testBook });
    });

    test('Return 404 if invalid id is passed', async () => {
        const response = await request(app).get('/books/1234567890');
        expect(response.statusCode).toBe(404);
    });
});

describe('POST /books', () => {
    test('Create a book', async () => {
        const newBook = {
            isbn: '978-0-948712-76-0',
            amazon_url: 'https://www.richardson.com/',
            author: 'Dana Smith',
            language: 'byn',
            pages: 987,
            publisher: 'Cooper, Snyder and Garza',
            title: 'Adaptive foreground model',
            year: 1960,
        };
        const response = await request(app).post('/books').send(newBook);
        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual({ book: newBook });
    });

    test('Return 400 if isbn is missing', async () => {
        const newBook = {
            amazon_url: 'https://www.richardson.com/',
            author: 'Dana Smith',
            language: 'byn',
            pages: 987,
            publisher: 'Cooper, Snyder and Garza',
            title: 'Adaptive foreground model',
            year: 1960,
        };
        const response = await request(app).post('/books').send(newBook);
        expect(response.statusCode).toBe(400);
    });

    test('Return 400 if missing properties are passed', async () => {
        const newBook = {};
        const response = await request(app).post('/books').send(newBook);
        expect(response.statusCode).toBe(400);
    });
});

describe('DELETE /books/:isbn', () => {
    test('Delete a book', async () => {
        const response = await request(app).delete(`/books/${testBook.isbn}`);
        expect(response.statusCode).toBe(200);
    });

    test('Return 404 if invalid isbn is passed', async () => {
        const response = await request(app).delete('/books/1234567890');
        expect(response.statusCode).toBe(404);
    });
});
