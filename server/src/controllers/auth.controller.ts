import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import jwt from 'jsonwebtoken';

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

export const googleCallback = (req: Request, res: Response) => {
  const user = req.user as any;
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '7d',
  });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.redirect(`${frontendUrl}/`);
};

export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  if (req.user) {
    res.json(req.user);
  } else {
    throw new ApiError(401, 'Not authenticated');
  }
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});
