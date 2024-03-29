import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';
import { SignOptions } from 'jsonwebtoken';

const createToken = (
  user: User,
  options: SignOptions,
) => {
  const { id } = user;

  return jwt.sign({ id }, import.meta.env.VITE_SECRET, options);
};

export default createToken;
