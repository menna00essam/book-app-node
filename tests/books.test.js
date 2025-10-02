const request = require('supertest');
const express = require('express');
const bookRoutes = require('../routes/bookRoutes'); 

const app = express();
app.use(express.json());
app.use('/api/books', bookRoutes);

jest.setTimeout(20000);

describe('Books API', () => {

  it('GET /api/books => should return all books', async () => {
    const res = await request(app).get('/api/books');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true); 
  });

  it('POST /api/books => should fail without admin auth', async () => {
    const res = await request(app)
      .post('/api/books')
      .send({
        title: 'Test Book',
        description: 'A test description',
        amount: 5
      });

    expect(res.statusCode).toBe(401);
  });

});
