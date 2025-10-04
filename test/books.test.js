const request = require('supertest');
const app = require('../app');
const Book = require('../models/Book');

describe('GET /api/books', () => {
  beforeEach(async () => {
    await Book.create({ title: 'Test Book', description: 'Desc', amount: 5, createdBy: 'mockUserId' });
  });

  afterEach(async () => {
    await Book.deleteMany();
  });

  it('should return all books', async () => {
    const res = await request(app).get('/api/books');
    expect(res.statusCode).toBe(200);
    expect(res.body.count).toBeGreaterThan(0);
    expect(res.body.data[0].title).toBe('Test Book');
  });
});
