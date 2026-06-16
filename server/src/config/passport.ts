import { Express, Request } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { prisma } from '../../prisma/prismaClient.js';
import { ApiError } from '../utils/ApiError.js';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';

const cookieExtractor = (req: any) => {
  let token = null;
  //console.log('All Cookies received:', req.cookies);
  if (req && req.cookies) {
    token = req.cookies['token'];
    //console.log('Extracted Token from cookie:', token ? 'Found' : 'Not Found');
  }
  return token || ExtractJwt.fromAuthHeaderAsBearerToken()(req);
};

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL:
        process.env.NODE_ENV === 'development'
          ? `${backendUrl}/api/auth/google/callback`
          : `${backendUrl}/auth/google/callback`,
      passReqToCallback: true,
    },
    async (req: Request, accessToken: string, refreshToken: string, profile: any, done: any) => {
      const email = profile.emails?.[0].value;
      if (!email) {
        return done(new ApiError(400, 'No email found in Google profile'));
      }

      try {
        const token = cookieExtractor(req);
        let guestUser = null;

        if (token) {
          try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
            guestUser = await prisma.user.findUnique({ where: { id: decoded.id } });
          } catch (e) {
            //console.error('Error verifying guest token during Google callback:', e);
          }
        }

        let user = await prisma.user.findUnique({
          where: { email },
        });

        if (user) {
          return done(null, user);
        }

        if (guestUser && guestUser.isGuest) {
          user = await prisma.user.update({
            where: { id: guestUser.id },
            data: {
              email: email,
              name: profile.displayName,
              avatarUrl: profile.photos?.[0]?.value,
              isGuest: false,
            },
          });
        } else {
          // Create new permanent user
          user = await prisma.user.create({
            data: {
              email,
              name: profile.displayName,
              avatarUrl: profile.photos?.[0]?.value,
            },
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error);
      }
    },
  ),
);

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: cookieExtractor,
      secretOrKey: process.env.JWT_SECRET || 'secret',
    },
    async (jwtPayload: any, done: (error: any, user?: any, info?: any) => void) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: jwtPayload.id },
        });

        if (user) {
          return done(null, user);
        }

        return done(null, false);
      } catch (error) {
        return done(error, false);
      }
    },
  ),
);

export default passport;
