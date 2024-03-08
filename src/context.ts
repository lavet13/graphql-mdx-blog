import { PrismaClient } from '@prisma/client';
import { authenticateUser, createToken } from './auth';
import { YogaInitialContext } from 'graphql-yoga';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { GraphQLError } from 'graphql';

export type ContextValue = {
  prisma: typeof prisma;
  me: jwt.JwtPayload | null;
};

const prisma = new PrismaClient().$extends({
  model: {
    user: {
      async login(login: string, password: string) {
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              {
                name: login,
              },
              {
                email: login,
              },
            ],
          },
        });

        if (!user) {
          throw new GraphQLError('Такого пользователя не существует!');
        }

        let isValid;
        try {
          isValid = await bcrypt.compare(password, user.password);
        } catch (err: unknown) {
          throw new GraphQLError('Failed while comparing passwords!');
        }

        if (!isValid) {
          throw new GraphQLError('Invalid password!');
        }

        const token = jwt.sign(
          { id: user.id, name: user.name, password: user.password },
          import.meta.env.VITE_SECRET,
          {
            expiresIn: '30m',
          },
        );

        return { token };
      },
    },
  },
});

export async function createContext(
  initialContext: YogaInitialContext,
): Promise<ContextValue> {
  return { prisma, me: authenticateUser(initialContext.request) };
}
