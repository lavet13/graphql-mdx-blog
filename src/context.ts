import { YogaInitialContext } from 'graphql-yoga';
import jwt from 'jsonwebtoken';
import prisma from './prisma/prisma';

import authenticateUser from './utils/auth/authenticate-user';

export type ContextValue = {
  prisma: typeof prisma;
  me: jwt.JwtPayload | null;
};

export async function createContext({
  request,
}: YogaInitialContext): Promise<ContextValue> {
  return { prisma, me: authenticateUser(request) };
}
