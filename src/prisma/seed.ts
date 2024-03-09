import prisma from './prisma';
import generatePasswordHash from '../utils/auth/generate-password-hash';

export default async function seed() {
  const password = 'negr';

  const hash = await generatePasswordHash(password);

  const category = await prisma.category.upsert({
    where: { name: 'sport' },
    update: {},
    create: {
      name: 'sport',
    },
  });

  const user = await prisma.user.upsert({
    where: {
      email: 'negr@mail.ru',
    },
    update: {},
    create: {
      email: 'negr@mail.ru',
      name: 'negr',
      password: hash,
      posts: {
        create: {
          title: 'some title',
          content: 'content...',
          categories: {
            connect: {
              id: category.id,
            },
          },
        },
      },
    },
  });

  console.log({ user, category });
}
