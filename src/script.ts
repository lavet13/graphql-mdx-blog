import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// https://www.prisma.io/docs/orm/prisma-client/type-safety/operating-against-partial-structures-of-model-types
// // 1: Define a type that includes the relation to `Post`
// const userWithPosts = Prisma.validator<Prisma.UserDefaultArgs>()({
//   include: { posts: true },
// });
//
// // 2: Define a type that only contains a subset of the scalar fields
// const userPersonalData = Prisma.validator<Prisma.UserDefaultArgs>()({
//   select: { email: true, name: true },
// });
//
// // 3: This type will include a user and all their posts
// type UserWithPosts = Prisma.UserGetPayload<typeof userWithPosts>;

// async function getUserWithPosts() {
//   const users = await prisma.user.findMany({include: { posts: true }});
//
//   return users;
// }
//
// // type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;
// // type UserWithPosts = ThenArg<ReturnType<typeof getUserWithPosts>>;
//
// // elegant way
// type UserWithPosts = Prisma.PromiseReturnType<typeof getUserWithPosts>;

export default async function main() {
  try {
  } catch (err) {
    console.error(err);
  } finally {
    prisma.$disconnect();
  }
}
