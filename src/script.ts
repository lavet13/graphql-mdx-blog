import { Prisma, PrismaClient } from '@prisma/client';
import util from 'util';

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
    // const newUser = await prisma.user.create({
    //   data: {
    //     name: 'Ivan',
    //     email: 'ivan@mail.ru',
    //   },
    // });
    //
    // const newPost = await prisma.post.create({
    //   data: {
    //     title: 'LOL',
    //     content: 'content',
    //     authorId: newUser.id,
    //   },
    // });
    //
    // console.log({ newUser, newPost });
    //
    // const postWithAuthor = await prisma.post.findMany({
    //   where: {
    //     id: 1,
    //   },
    //   include: {
    //     author: true,
    //   },
    // });
    //
    // console.log(util.inspect(postWithAuthor, { depth: null }));
    //
    // const newComment = await prisma.comment.create({
    //   data: {
    //     text: 'cool post btw',
    //     postId: 1,
    //     userId: 1,
    //   },
    // });
    // console.log(util.inspect(newComment, { colors: true, depth: null }));
    //
    // const userWithCommentsAndPost = await prisma.user.findMany({
    //   where: {
    //     id: 1,
    //   },
    //   include: {
    //     posts: true,
    //     comments: true,
    //   },
    // });
    //
    // console.log('userWithCommentAndPost', util.inspect(userWithCommentsAndPost, { colors: true, depth: null }));
    //
    // const commentWithUserAndPost = await prisma.comment.findUnique({
    //   where: { id: 1, },
    //   include: {
    //     post: true,
    //     user: true,
    //   },
    // });
    //
    // console.log('commentWithUserAndPost', util.inspect(commentWithUserAndPost, { colors: true, depth: null }));

    // const updatedPost = await prisma.post.update({
    //   where: {
    //     id: 1,
    //   },
    //   data: {
    //     categories: {
    //       connect: {
    //         id: 1,
    //       },
    //     },
    //   },
    // });
    //
    // console.log({ updatedPost });

    // const postsToUpdate = await prisma.post.findMany({
    //   where: {
    //     categories: {
    //       some: {
    //         id: 1,
    //       },
    //     },
    //   },
    // });

    // const postsToUpdate = await prisma.post.findMany();
    // console.log(
    //   'postsToUpdate',
    //   util.inspect(postsToUpdate, { colors: true, depth: null }),
    // );
    //
    // const updatedPosts = await Promise.all(
    //   postsToUpdate.map(async post => {
    //     const updatedPost = await prisma.post.update({
    //       where: {
    //         id: post.id,
    //       },
    //       include: {
    //         categories: true,
    //       },
    //       data: {
    //         categories: {
    //           connect: {
    //             id: 2,
    //           },
    //         },
    //       },
    //     });
    //
    //     return updatedPost;
    //   }),
    // );
    //
    // console.log(
    //   'updatedPosts',
    //   util.inspect(updatedPosts, { colors: true, depth: null }),
    // );
    //
    // const deletedCategoryFromPost = await prisma.post.update({
    //   where: {
    //     id: 1,
    //   },
    //   include: {
    //     categories: true,
    //   },
    //   data: {
    //     categories: {
    //       disconnect: {
    //         id: 1,
    //       },
    //     },
    //   },
    // });
    //
    // console.log(
    //   'deletedCategoryFromPost',
    //   util.inspect(deletedCategoryFromPost, { colors: true, depth: null }),
    // );
  } catch (err) {
    console.error(err);
  } finally {
    prisma.$disconnect();
  }
}
