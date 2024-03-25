import { Prisma } from '@prisma/client';
import { GraphQLError } from 'graphql';

import createToken from '../../utils/auth/create-token';
import validatePassword from '../../utils/auth/validate-password';
import generatePasswordHash from '../../utils/auth/generate-password-hash';

const userExtension = Prisma.defineExtension(client => {
  return client.$extends({
    model: {
      user: {
        async login(login: string, password: string) {
          const user = await client.user.findFirst({
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

          const isValid = await validatePassword(password, user.password);

          if (!isValid) {
            throw new GraphQLError('Invalid password!');
          }

          const token = createToken(user, { expiresIn: '24h' });

          return { token };
        },
        async signup(email: string, name: string, password: string) {
          const hashedPassword = await generatePasswordHash(password);

          const newUser = await client.user.create({
            data: {
              email,
              name,
              password: hashedPassword,
            },
          });

          const token = createToken(newUser, { expiresIn: '24h' });

          return { token };
        },
      },
    },
  });
});

export default userExtension;
