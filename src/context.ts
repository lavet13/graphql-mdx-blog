import { PrismaClient } from '@prisma/client';
import { YogaInitialContext } from 'graphql-yoga';
import jwt from 'jsonwebtoken';

import authenticateUser from './utils/auth/authenticate-user';
import userExtension from './prisma/extensions/user/user.extensions';

export type ContextValue = {
  prisma: typeof prisma;
  me: jwt.JwtPayload | null;
};

const prisma = new PrismaClient().$extends(userExtension);

export async function createContext({
  request,
}: YogaInitialContext): Promise<ContextValue> {
  return { prisma, me: authenticateUser(request) };
}
