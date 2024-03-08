import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import { GraphQLError } from 'graphql';
// import { User } from '@prisma/client';

// export const validatePassword = async (argPassword: string, sourcePassword: string) => {
//   try {
//     return await bcrypt.compare(argPassword, sourcePassword);
//   } catch(err: unknown) {
//     throw new GraphQLError('Invalid password!');
//   }
// };

export const generatePasswordHash = async (password: string) => {
  const saltRounds = 10;

  try {
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    throw new GraphQLError('Failed while hashing password!');
  }
};

// export const createToken = (
//   user: User,
//   secret: Secret,
//   options: SignOptions,
// ) => {
//   const { id, email, name } = user;
//
//   return jwt.sign({ id, email, name }, secret, options);
// };

export const authenticateUser = (request: Request): jwt.JwtPayload | null => {
  const header = request.headers.get('authorization');

  if (!header) return null;

  const [, token] = header.split(' ');

  if (!token) {
    throw new GraphQLError('Forget to put Bearer at the beginning!');
  }

  try {
    return jwt.verify(token, import.meta.env.VITE_SECRET) as jwt.JwtPayload;
  } catch (err) {
    throw new GraphQLError('Session timeout. Please authenticate again.');
  }
};
