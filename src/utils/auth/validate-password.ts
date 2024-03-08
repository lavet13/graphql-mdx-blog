import bcrypt from 'bcryptjs';

import { GraphQLError } from "graphql";

const validatePassword = async (argPassword: string, sourcePassword: string) => {
  try {
    return await bcrypt.compare(argPassword, sourcePassword);
  } catch(err: unknown) {
    throw new GraphQLError('Failed while comparing passwords!');
  }
};

export default validatePassword;
