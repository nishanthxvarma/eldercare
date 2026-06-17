import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { AuthService } from '../services/auth.service';
import { env } from '../config/env';

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { user, tokens } = await AuthService.login(email, password);

  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        facilityId: user.facilityId,
      },
      accessToken: tokens.accessToken,
    },
    message: 'Login successful',
  });
});

export const register = catchAsync(async (req: Request, res: Response) => {
  const user = await AuthService.register(req.body);
  res.status(201).json({
    success: true,
    data: { id: user._id, email: user.email },
    message: 'User registered successfully',
  });
});

export const logout = catchAsync(async (req: Request, res: Response) => {
  res.clearCookie('refreshToken');
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

export const refresh = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    res.status(401).json({ success: false, message: 'Refresh token not found' });
    return;
  }
  const payload = await AuthService.verifyRefreshToken(refreshToken);
  
  // Need to import User model, or we can use another service method, let's just generate tokens directly from payload or fetch user.
  // I will just fetch User here. Wait, User is not imported. Let me add it.
  const { User } = await import('../models/User');
  const user = await User.findById(payload.id);
  if (!user || !user.isActive) {
    res.status(401).json({ success: false, message: 'User not found or inactive' });
    return;
  }
  
  const tokens = AuthService.generateTokens(user);
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  
  res.status(200).json({
    success: true,
    data: { accessToken: tokens.accessToken }
  });
});

// Stubs for forgot/reset password
export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'Password reset link sent to email (stub)' });
});

export const resetPassword = catchAsync(async (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'Password reset successfully (stub)' });
});
