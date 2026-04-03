import { Express } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { prisma } from '../../prisma/prismaClient';
import { ApiError } from '../utils/ApiError';
import 'dotenv/config';

const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${backendUrl}/api/auth/google/callback`,
    },
    async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      const email = profile.emails?.[0].value;
      if (!email) {
        return done(new ApiError(400, 'No email found in Google profile'));
      }

      try {
        let user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
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

const cookieExtractor = (req: any) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['token'];
  }
  return token || ExtractJwt.fromAuthHeaderAsBearerToken()(req);
};

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: cookieExtractor,
      secretOrKey: process.env.JWT_SECRET || 'secret',
    },
    async (jwtPayload, done) => {
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
