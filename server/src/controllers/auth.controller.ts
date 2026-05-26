import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import jwt from 'jsonwebtoken';
import { prisma } from '../../prisma/prismaClient.js';

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

const setTokenCookie = (res: Response, token: string) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
};

export const googleCallback = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as any;
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '7d',
  });

  console.log('Setting cookie for user:', user.email);
  console.log('Frontend URL for redirect:', frontendUrl);

  setTokenCookie(res, token);
  res.redirect(`${frontendUrl}/`);
});

export const guestLogin = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.create({
    data: {
      name: 'Guest User',
      isGuest: true,
    },
  });

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '7d',
  });

  setTokenCookie(res, token);
  res.json(user);
});

export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  if (req.user) {
    res.json(req.user);
  } else {
    throw new ApiError(401, 'Not authenticated');
  }
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.clearCookie('token', {
    path: '/',
    secure: true,
    sameSite: 'none',
  });
  res.json({ message: 'Logged out' });
});
