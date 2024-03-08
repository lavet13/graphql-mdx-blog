import { GraphQLError } from 'graphql';
import { Prisma } from '@prisma/client';

import { ContentLimit, Resolvers } from '../../__generated__/types';

import DateScalar from '../../scalars/date.scalars';

import { parseIntSafe } from '../../../utils/resolvers/parseIntSafe';

import { createToken, generatePasswordHash, validatePassword } from '../../../auth';

const resolvers: Resolvers = {
  Date: DateScalar,

  Query: {
    posts(_, args, context) {
      const filterNeedle = args.filterNeedle;
      const where: Prisma.PostWhereInput = filterNeedle ? {
        OR: [
          { title: { contains: filterNeedle } },
          { content: { contains: filterNeedle } },
        ],
      } : {};

      return context.prisma.post.findMany({ where });
    },
    postById(_, args, context) {
      const postId = parseIntSafe(args.postId);

      if (postId === null) {
        return Promise.reject(
          new GraphQLError(`Invalid postId. Please provide a valid integer.`),
        );
      }

      return context.prisma.post.findUnique({
        where: {
          id: postId,
        },
      });
    },
    authorById(_, args, context) {
      const authorId = parseIntSafe(args.authorId);

      if (authorId === null) {
        return Promise.reject(
          new GraphQLError(`Invalid authorId. Please provide a valid integer.`),
        );
      }

      return context.prisma.user.findUnique({
        where: {
          id: authorId,
        },
      });
    },
    postComments(_, args, context) {
      const postId = parseIntSafe(args.postId);

      if (postId === null) {
        return Promise.reject(
          new GraphQLError(`Invalid postId. Please provide a valid integer.`),
        );
      }

      return context.prisma.comment.findMany({
        where: {
          postId,
        },
      });
    },
    authorComments(_, args, context) {
      const authorId = parseIntSafe(args.authorId);

      if (authorId === null) {
        return Promise.reject(
          new GraphQLError(`Invalid authorId. Please provide a valid integer.`),
        );
      }

      return context.prisma.comment.findMany({
        where: {
          userId: authorId,
        },
      });
    },
    // searchPA(_, args) {
    //   const query = args.query.trim().replace(/\u200E/g, '');
    //   if (query.length === 0) return [];
    //
    //   const lowerQuery = query.toLowerCase();
    //
    //   const res = [];
    //
    //   for (const p of posts) {
    //     const lowerPostTitle = p.title.trim().toLowerCase();
    //     const lowerAuthorName = p.author.name.trim().toLowerCase();
    //
    //     if (
    //       lowerPostTitle.startsWith(lowerQuery) ||
    //       lowerPostTitle.indexOf(' ' + lowerQuery) !== -1
    //     ) {
    //       res.push(p);
    //     }
    //
    //     if (
    //       lowerAuthorName.startsWith(lowerQuery) ||
    //       lowerAuthorName.indexOf(' ' + lowerQuery) !== -1
    //     ) {
    //       res.push(p.author);
    //     }
    //   }
    //
    //   return res;
    // },
  },
  Mutation: {
    async login(_, args, context) {
      const login = args.loginInput.login;
      const argPassword = args.loginInput.password;

      return context.prisma.user.login(login, argPassword);
    },
    async signup(_, args, context) {
      const { email, name, password } = args.signupInput;

      const hashedPassword = await generatePasswordHash(password);

      const newUser = await context.prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
        },
      });

      const token = createToken(newUser, import.meta.env.VITE_SECRET, { expiresIn: '30m' });

      return { token };
    },
    async createPost(_, args, context) {
      const { title, content } = args.postInput;
      const authorId = parseIntSafe(args.postInput.authorId);
      const categoryId = parseIntSafe(args.postInput.categoryId);

      if(authorId === null) {
        return Promise.reject(new GraphQLError(`Invalid authorId. Please provide a valid integer.`));
      }
      if(categoryId === null) {
        return Promise.reject(new GraphQLError(`Invalid categoryId. Please provide a valid integer.`));
      }

      const newPost = await context.prisma.post.create({
        data: {
          categories: {
            connect: {
              id: categoryId,
            },
          },
          authorId,
          title,
          content,
        },
      })

      return newPost;
    },
    async addComment(_, args, context) {
      const postId = parseIntSafe(args.commentInput.postId);
      const authorId = parseIntSafe(args.commentInput.authorId);
      const text = args.commentInput.text;

      if(text.trim().length === 0 || text.trim().length <= 2) {
        return Promise.reject(
          new GraphQLError(`Text cannot be empty. Please provide at least 3 characters.`),
        );
      }

      if (postId === null) {
        return Promise.reject(
          new GraphQLError(`Invalid postId. Please provide a valid integer.`),
        );
      }

      if (authorId === null) {
        return Promise.reject(
          new GraphQLError(`Invalid authorId. Please provide a valid integer.`),
        );
      }

      const newComment = await context.prisma.comment.create({
        data: {
          postId,
          userId: authorId,
          text,
        },
      });

      return newComment;
    },
    async addProfile(_, args, context) {
      const { bio } = args.profileInput;
      const authorId = parseIntSafe(args.profileInput.userId);

      if (authorId === null) {
        return Promise.reject(
          new GraphQLError(`Invalid authorId. Please provide a valid integer.`),
        );
      }

      const newProfile = await context.prisma.profile.create({
        data: {
          userId: authorId,
          bio,
        },
      });

      return newProfile;
    },
  },
  Comment: {
    post(parent, _, context) {
      return context.prisma.post.findUniqueOrThrow({
        where: {
          id: parent.postId,
        },
      });
    },
    author(parent, _, context) {
      return context.prisma.user.findUniqueOrThrow({
        where: {
          id: parent.userId,
        },
      });
    }
  },
  Profile: {
    user(parent, _, context) {
      return context.prisma.user.findUniqueOrThrow({
        where: {
          id: parent.userId,
        },
      });
    },
  },
  User: {
    posts(parent, _, context) {
      return context.prisma.post.findMany({
        where: {
          authorId: parent.id,
        },
      });
    },
    comments(parent, _, context) {
      return context.prisma.comment.findMany({
        where: {
          userId: parent.id,
        },
      });
    },
    profile(parent, _, context) {
      return context.prisma.profile.findUnique({
        where: {
          userId: parent.id,
        },
      });
    },
  },
  Post: {
    preview(parent, args) {
      const { size } = args;

      switch (size) {
        case ContentLimit.Small:
          return parent.content.slice(0, 20);
        case ContentLimit.Medium:
          return parent.content.slice(0, 50);
        case ContentLimit.Large:
          return parent.content.slice();
      }
    },
    author(parent, _, context) {
      return context.prisma.user.findUniqueOrThrow({
        where: {
          id: parent.authorId,
        },
      });
    },
    comments(parent, _, context) {
      return context.prisma.comment.findMany({
        where: {
          post: {
            id: parent.id,
          },
        },
      });
    },
    categories(parent, _, context) {
      return context.prisma.category.findMany({
        where: {
          posts: {
            some: {
              id: parent.id,
            },
          },
        },
      });
    },
  },
};

export default resolvers;
