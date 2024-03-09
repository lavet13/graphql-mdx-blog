import prisma from './prisma';
import generatePasswordHash from '../utils/auth/generate-password-hash';
import inspect from '../utils/debug/inspect';

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
    },
  });

  const post = await prisma.post.upsert({
    where: {
      authorId: user.id,
    },
    update: {},
    create: {
      title: 'some title',
      content: 'some content',
      author: {
        connect: {
          id: user.id,
        },
      },
      categories: {
        connect: {
          id: category.id,
        },
      },
    },
  });

  console.log({ user, post, category });

  inspect({ user, post, category });
}
