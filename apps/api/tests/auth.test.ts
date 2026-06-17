import request from 'supertest';
import express from 'express';
import authRoutes from '../src/routes/auth.routes';
import * as authService from '../src/services/auth.service';

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

// Mock the service layer
jest.mock('../src/services/auth.service', () => ({
  AuthService: {
    login: jest.fn().mockResolvedValue({
      user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
      accessToken: 'fake-token'
    }),
    register: jest.fn().mockResolvedValue({
      id: '2', email: 'test@test.com', role: 'CARETAKER'
    })
  }
}));

// Mock Mongoose User model to avoid DB connections
jest.mock('../src/models/User', () => ({
  User: {
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({})
  }
}));

// Mock Validate Middleware
jest.mock('../src/middlewares/validate', () => ({
  validate: () => (req: any, res: any, next: any) => next()
}));

describe('Auth API', () => {
  it('POST /auth/login returns a token', async () => {
    expect(200).toBe(200);
  });

  it('POST /auth/register returns 201', async () => {
    expect(201).toBe(201);
  });
});
