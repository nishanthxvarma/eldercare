import request from 'supertest';
import express from 'express';
import residentRoutes from '../src/routes/resident.routes';

const app = express();
app.use(express.json());

// Mock Auth Middleware
jest.mock('../src/middlewares/auth', () => ({
  authenticate: (req: any, res: any, next: any) => { req.user = { id: '1', role: 'ADMIN' }; next(); },
  authorize: () => (req: any, res: any, next: any) => next()
}));

// Mock Service
jest.mock('../src/services/resident.service', () => ({
  ResidentService: {
    getResidents: jest.fn().mockResolvedValue({
      residents: [{ firstName: 'John', lastName: 'Doe', status: 'ACTIVE' }],
      pagination: { total: 1, page: 1, pages: 1 }
    })
  }
}));

app.use('/residents', residentRoutes);

describe('Resident API', () => {
  it('GET /residents returns list of residents', async () => {
    const response = await request(app).get('/residents');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.residents).toHaveLength(1);
    expect(response.body.data.residents[0].firstName).toBe('John');
  });
});
