import request from 'supertest';
import express from 'express';
import medicationRoutes from '../src/routes/medication.routes';

const app = express();
app.use(express.json());

// Mock Auth Middleware
jest.mock('../src/middlewares/auth', () => ({
  authenticate: (req: any, res: any, next: any) => { req.user = { id: '1', role: 'ADMIN' }; next(); },
  authorize: () => (req: any, res: any, next: any) => next()
}));

// Mock Service
jest.mock('../src/services/medication.service', () => ({
  MedicationService: {
    getMedications: jest.fn().mockResolvedValue([
      { name: 'Aspirin', dosage: '100mg' }
    ]),
    logAdministration: jest.fn().mockResolvedValue({
      status: 'ADMINISTERED'
    })
  }
}));

app.use('/medications', medicationRoutes);

describe('Medication API', () => {
  it('GET /medications returns medications list', async () => {
    const response = await request(app).get('/medications');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data[0].name).toBe('Aspirin');
  });

  it('POST /medications/:id/log logs administration', async () => {
    const response = await request(app)
      .post('/medications/123/log')
      .send({ status: 'ADMINISTERED' });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
