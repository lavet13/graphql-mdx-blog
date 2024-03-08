import bcrypt from 'bcryptjs';

import { GraphQLError } from 'graphql';

const generatePasswordHash = async (password: string) => {
  const saltRounds = 10;

  try {
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    throw new GraphQLError('Failed while hashing password!');
  }
};

export default generatePasswordHash;
