import prisma from './prisma';
import generatePasswordHash from '../utils/auth/generate-password-hash';

let countDown = 0;

export default async function seed() {
  const password = 'negr';

  console.log({ countDown, isCreated: countDown > 0 });
  if(countDown > 0) {
    return;
  }

  countDown++;

  const hash = await generatePasswordHash(password);

  await prisma.category.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.profile.deleteMany({});
  await prisma.user.deleteMany({});

  const firstUser = await prisma.user.create({
    data: {
      email: 'negr@mail.ru',
      name: 'negr',
      password: hash,
      profile: {
        create: {
          bio: 'LULE',
        },
      },
    },
    include: {
      profile: true,
    },
  });

  const secondUser = await prisma.user.create({
    data: {
      email: 'second@mail.ru',
      name: 'second',
      password: hash,
      profile: {
        create: {
          bio: 'LULW',
        },
      },
    },
    include: {
      profile: true,
    },
  });

  const thirdUser = await prisma.user.create({
    data: {
      email: 'third@mail.ru',
      name: 'third',
      password: hash,
      profile: {
        create: {
          bio: 'OMEGALUL',
        },
      },
    },
    include: {
      profile: true,
    },
  });

  const category = await prisma.category.create({
    data: {
      name: 'sport',
      posts: {
        create: [
          {
            title: 'first post ever made!',
            content: 'some ass content',
            author: {
              connect: {
                id: firstUser.id,
              },
            },
            comments: {
              create: {
                text: 'lule',
                userId: firstUser.id,
              },
            },
          },
          {
            title: 'second post ever made!',
            content: 'some second ass content',
            author: {
              connect: {
                id: secondUser.id,
              },
            },
            comments: {
              create: {
                text: 'hahahahhaha, so funnE',
                userId: firstUser.id,
              },
            },
          },
          {
            title: 'third post ever made!',
            content: 'some third ass content',
            author: {
              connect: {
                id: thirdUser.id,
              },
            },
            comments: {
              create: {
                text: 'I cannot MegaLYL',
                userId: firstUser.id,
              },
            },
          },
        ],
      },
    },
  });

  console.log({ firstUser, secondUser, thirdUser, category });
}
