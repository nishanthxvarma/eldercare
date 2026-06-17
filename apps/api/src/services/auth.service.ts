import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';

export class AuthService {
  static generateTokens(user: IUser) {
    const payload = { id: user._id, role: user.role, facilityId: user.facilityId };
    const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET as string, { expiresIn: env.JWT_ACCESS_EXPIRES_IN as any });
    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET as string, { expiresIn: env.JWT_REFRESH_EXPIRES_IN as any });
    return { accessToken, refreshToken };
  }

  static async verifyRefreshToken(token: string): Promise<any> {
    try {
      return jwt.verify(token, env.JWT_REFRESH_SECRET as string);
    } catch (error) {
      throw new ApiError(401, 'Invalid or expired refresh token');
    }
  }

  static async login(email: string, password: string) {
    const user = await User.findOne({ email, isDeleted: false });
    if (!user || !user.isActive) {
      throw new ApiError(401, 'Invalid credentials or inactive account');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const tokens = this.generateTokens(user);
    return { user, tokens };
  }

  static async register(userData: any) {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new ApiError(400, 'Email already in use');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(userData.password, salt);

    const user = await User.create({
      ...userData,
      passwordHash,
    });

    return user;
  }
}
