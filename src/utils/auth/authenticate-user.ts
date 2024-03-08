import jwt from 'jsonwebtoken';

import { GraphQLError } from 'graphql';

export default function authenticateUser(
  request: Request,
): jwt.JwtPayload | null {
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
}
