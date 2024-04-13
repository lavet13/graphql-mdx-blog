import { GraphQLError } from 'graphql';
import { Post, User } from '@prisma/client';

import { ContentLimit, Resolvers } from '../../__generated__/types';

import DateScalar from '../../scalars/date.scalars';

import { parseIntSafe } from '../../../utils/resolvers/parseIntSafe';
import {
  ResolversComposerMapping,
  composeResolvers,
} from '@graphql-tools/resolvers-composition';
import { isAuthenticated } from '../../composition/authorization';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import {
  validPostId,
  validCommentId,
  validCategoryId,
} from '../../composition/validIds';
import { applyConstraints } from '../../../utils/resolvers/applyConstraints';

const resolvers: Resolvers = {
  Date: DateScalar,

  Query: {
    me(_, __, ctx) {
      return ctx.prisma.user.findFirst({
        where: {
          id: ctx.me!.id,
        },
      });
    },
    async posts(_, args, ctx) {
      enum PaginationDirection {
        NONE = 'NONE',
        FORWARD = 'FORWARD',
        BACKWARD = 'BACKWARD',
      }

      const direction: PaginationDirection = args.input.after
        ? PaginationDirection.FORWARD
        : args.input.before
          ? PaginationDirection.BACKWARD
          : PaginationDirection.NONE;
      console.log({ before: args.input.before, after: args.input.after });

      const take = Math.abs(
        applyConstraints({
          type: 'take',
          min: 1,
          max: 50,
          value: args.input.take ?? 30,
        }),
      );

      let cursor =
        direction === PaginationDirection.NONE
          ? undefined
          : {
              id:
                direction === PaginationDirection.FORWARD
                  ? args.input.after ?? undefined
                  : args.input.before ?? undefined,
            };

      // in case where we might get cursor which points to nothing
      if (direction !== PaginationDirection.NONE) {
        // checking if the cursor pointing to the post doesn't exist,
        // otherwise skip
        const cursorPost = await ctx.prisma.post.findUnique({
          where: { id: cursor?.id },
        });

        if (!cursorPost) {
          if (direction === PaginationDirection.FORWARD) {
            // this shit is shit and isn't work for me,
            // or because perhaps I am retard ☺️💕
            //
            // const previousValidPost = await ctx.prisma.post.findFirst({
            //   where: { id: { lt: args.input.after } },
            //   orderBy: { id: 'desc' },
            // });
            // console.log({ previousValidPost });
            // cursor = previousValidPost ? { id: previousValidPost.id } : undefined;

            cursor = { id: -1 }; // we guarantee posts are empty
          } else if (direction === PaginationDirection.BACKWARD) {
            const nextValidPost = await ctx.prisma.post.findFirst({
              where: { id: { gt: args.input.before } },
              orderBy: {
                id: 'asc',
              },
            });
            console.log({ nextValidPost });

            cursor = nextValidPost ? { id: nextValidPost.id } : undefined;
          }
        }
      }

      const query = args.input.query?.trim(); // user input
      const searching = !!query && query.length !== 0;
      console.log({ searching, query });

      cursor = !searching ? cursor : undefined;

      // fetching posts with extra one, so to determine if there's more to fetch
      const posts = await ctx.prisma.post.findMany({
        take:
          direction === PaginationDirection.BACKWARD ? -(take + 1) : take + 1, // Fetch one extra post for determining `hasNextPage`
        cursor,
        skip: cursor ? 1 : undefined, // Skip the cursor post for the next/previous page
        orderBy: { id: 'asc' }, // Order by id for consistent pagination
        where: {
          OR: query
            ? [{ title: { contains: query } }, { content: { contains: query } }]
            : undefined,
        },
      });

      // If no results are retrieved, it means we've reached the end of the
      // pagination or because we stumble upon invalid cursor, so on the
      // client we just clearing `before` and `after` cursors to get first posts
      // forward pagination could have no posts at all,
      // or because cursor is set to `{ id: -1 }`, for backward pagination
      // the only thing would happen if only posts are empty!
      if (posts.length === 0) {
        return {
          edges: [],
          pageInfo: {
            endCursor: null,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        };
      }

      // If the number of posts fetched is less than or equal to the
      // `take` value, you include all the posts in the `edges` array.
      // However, if the number of posts fetched is greater than
      // the `take` value, you exclude the extra post from
      // the `edges` array by slicing the posts array.
      const edges =
        posts.length <= take
          ? posts
          : direction === PaginationDirection.BACKWARD
            ? posts.slice(1, posts.length)
            : posts.slice(0, -1);

      const hasMore = posts.length > take;

      const startCursor = edges.length === 0 ? null : edges[0]?.id;
      const endCursor = edges.length === 0 ? null : edges.at(-1)?.id;

      // This is where the condition `edges.length < posts.length` comes into
      // play. If the length of the `edges` array is less than the length
      // of the `posts` array, it means that the extra post was fetched and
      // excluded from the `edges` array. That implies that there are more
      // posts available to fetch in the current pagination direction.
      const hasNextPage =
        direction === PaginationDirection.BACKWARD ||
        (direction === PaginationDirection.FORWARD && hasMore) ||
        (direction === PaginationDirection.NONE && edges.length < posts.length);
      // /\
      // |
      // |
      // NOTE: This condition `edges.length < posts.length` is essentially
      // checking the same thing as `hasMore`, which is whether there are more
      // posts available to fetch. Therefore, you can safely replace
      // `edges.length < posts.length` with hasMore in the condition for
      // determining hasNextPage. Both conditions are equivalent and will
      // produce the same result.

      const hasPreviousPage =
        direction === PaginationDirection.FORWARD ||
        (direction === PaginationDirection.BACKWARD && hasMore);

      return {
        edges,
        pageInfo: {
          startCursor,
          endCursor,
          hasNextPage,
          hasPreviousPage,
        },
      };
    },
    async postById(_, args, ctx) {
      const postId = parseIntSafe(args.postId);

      if (postId === null) {
        return Promise.reject(
          new GraphQLError(`Invalid postId. Please provide a valid integer.`),
        );
      }

      return ctx.prisma.post
        .findUniqueOrThrow({
          where: {
            id: postId,
          },
        })
        .catch((err: unknown) => {
          if (
            err instanceof PrismaClientKnownRequestError &&
            err.code === 'P2025'
          ) {
            return Promise.reject(
              new GraphQLError(`Cannot find post by id \`${postId}\``),
            );
          }

          return Promise.reject(err);
        });
    },
    authorById(_, args, ctx) {
      const authorId = parseIntSafe(args.authorId);

      if (authorId === null) {
        return Promise.reject(
          new GraphQLError(`Invalid authorId. Please provide a valid integer.`),
        );
      }

      return ctx.prisma.user.findUnique({
        where: {
          id: authorId,
        },
      });
    },
    postComments(_, args, ctx) {
      const postId = parseIntSafe(args.postId);

      if (postId === null) {
        return Promise.reject(
          new GraphQLError(`Invalid postId. Please provide a valid integer.`),
        );
      }

      return ctx.prisma.comment.findMany({
        where: {
          postId,
        },
      });
    },
    authorComments(_, args, ctx) {
      const authorId = parseIntSafe(args.authorId);

      if (authorId === null) {
        return Promise.reject(
          new GraphQLError(`Invalid authorId. Please provide a valid integer.`),
        );
      }

      return ctx.prisma.comment.findMany({
        where: {
          userId: authorId,
        },
      });
    },
    async searchPA(_, args, ctx) {
      const query = args.query.trim().replace(/\u200E/g, '');
      if (query.length === 0) return [];

      const posts = await ctx.prisma.post.findMany({
        where: {
          OR: [
            {
              title: {
                mode: 'insensitive',
                contains: query,
              },
            },
            {
              content: {
                mode: 'insensitive',
                contains: query,
              },
            },
          ],
        },
      });

      const users = await ctx.prisma.user.findMany({
        where: {
          OR: [
            {
              email: {
                mode: 'insensitive',
                contains: query,
              },
            },
            {
              name: {
                mode: 'insensitive',
                contains: query,
              },
            },
          ],
        },
      });

      return [...users, ...posts];
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
    async login(_, args, ctx) {
      const { login, password } = args.loginInput;

      const { token } = await ctx.prisma.user.login(login, password);
      console.log({ loginToken: token });

      try {
        await ctx.request.cookieStore?.set({
          name: 'authorization',
          value: token,
          sameSite: 'lax',
          secure: true,
          httpOnly: true,
          domain: null,
          expires: null,
          path: '/',
        });
      } catch(reason) {
        console.error(`It failed: ${reason}`);
        throw new GraphQLError(`failed while setting the cookie`);
      }

      // console.log({ authorization: await ctx.request.cookieStore?.get('authorization') });
      // console.log({ cookies: await ctx.request.cookieStore?.getAll()});

      return { token };
    },
    async signup(_, args, ctx) {
      const { email, name, password } = args.signupInput;

      const { token } = await ctx.prisma.user.signup(email, name, password);

      try {
        await ctx.request.cookieStore?.set({
          name: 'authorization',
          value: token,
          sameSite: 'lax',
          secure: true,
          httpOnly: true,
          domain: null,
          expires: null,
          path: '/',
        });
      } catch(reason) {
        console.error(`It failed: ${reason}`);
        throw new GraphQLError(`failed while setting the cookie`);
      }

      // console.log({ authorization: await ctx.request.cookieStore?.get('authorization') });
      // console.log({ cookies: await ctx.request.cookieStore?.getAll()});

      return { token };
    },
    async createPost(_, args, ctx) {
      const { title, content } = args;
      const authorId = ctx.me!.id;
      const categoryId = parseInt(args.categoryId);

      const newPost = await ctx.prisma.post
        .create({
          data: {
            categories: {
              connect: {
                id: categoryId,
              },
            },
            author: {
              connect: {
                id: authorId,
              },
            },
            title,
            content,
          },
        })
        .catch((err: unknown) => {
          if (
            err instanceof PrismaClientKnownRequestError &&
            err.code === 'P2025'
          ) {
            return Promise.reject(
              new GraphQLError(`Cannot find categoryId \`${categoryId}\``),
            );
          }

          return Promise.reject(err);
        });

      return newPost;
    },
    async addCategory(_, args, ctx) {
      const name = args.name;

      return ctx.prisma.category.create({
        data: {
          name,
        },
      });
    },
    async addComment(_, args, ctx) {
      const postId = parseInt(args.postId, 10);
      const authorId = ctx.me!.id;
      const text = args.text;

      if (text.trim().length === 0 || text.trim().length <= 2) {
        return Promise.reject(
          new GraphQLError(
            `Text cannot be empty. Please provide at least 3 characters.`,
          ),
        );
      }

      const newComment = await ctx.prisma.comment
        .create({
          data: {
            postId,
            userId: authorId,
            text,
          },
        })
        .catch((err: unknown) => {
          if (
            err instanceof PrismaClientKnownRequestError &&
            err.code === 'P2003'
          ) {
            return Promise.reject(
              new GraphQLError(`Cannot find post with id \`${postId}\``),
            );
          }

          return Promise.reject(err);
        });

      return newComment;
    },
    async updateComment(_, args, ctx) {
      const id = parseInt(args.id, 10);
      const text = args.text;

      return ctx.prisma.comment
        .update({
          where: {
            id,
          },
          data: {
            text,
          },
        })
        .catch((err: unknown) => {
          if (
            err instanceof PrismaClientKnownRequestError &&
            err.code === 'P2025'
          ) {
            return Promise.reject(
              new GraphQLError(`Cannot find the comment with id \`${id}\``),
            );
          }
          return Promise.reject(err);
        });
    },
    async upsertProfile(_, args, ctx) {
      const { bio } = args.profileInput;

      return ctx.prisma.profile.upsert({
        where: {
          userId: ctx.me!.id,
        },
        update: {
          bio,
        },
        create: {
          bio,
          userId: ctx.me!.id,
        },
      });
    },
  },
  SearchResultPA: {
    __resolveType(thing) {
      if ((thing as Post).title) {
        return 'Post';
      } else if ((thing as User).password) {
        return 'User';
      } else {
        throw new GraphQLError('Unable to determine search type!');
      }
    },
  },
  Comment: {
    post(parent, _, ctx) {
      return ctx.prisma.post.findUniqueOrThrow({
        where: {
          id: parent.postId,
        },
      });
    },
    author(parent, _, ctx) {
      return ctx.prisma.user.findUniqueOrThrow({
        where: {
          id: parent.userId,
        },
      });
    },
  },
  Profile: {
    user(parent, _, ctx) {
      return ctx.prisma.user.findUniqueOrThrow({
        where: {
          id: parent.userId,
        },
      });
    },
  },
  User: {
    posts(parent, _, ctx) {
      return ctx.prisma.post.findMany({
        where: {
          authorId: parent.id,
        },
      });
    },
    comments(parent, _, ctx) {
      return ctx.prisma.comment.findMany({
        where: {
          userId: parent.id,
        },
      });
    },
    profile(parent, _, ctx) {
      return ctx.prisma.profile.findUnique({
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
    author(parent, _, ctx) {
      return ctx.prisma.user.findUniqueOrThrow({
        where: {
          id: parent.authorId,
        },
      });
    },
    comments(parent, _, ctx) {
      return ctx.prisma.comment.findMany({
        where: {
          post: {
            id: parent.id,
          },
        },
      });
    },
    categories(parent, _, ctx) {
      return ctx.prisma.category.findMany({
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

const resolversComposition: ResolversComposerMapping<Resolvers> = {
  'Query.me': [isAuthenticated()],
  'Mutation.createPost': [isAuthenticated(), validCategoryId()],
  'Mutation.addComment': [isAuthenticated(), validPostId()],
  'Mutation.updateComment': [isAuthenticated(), validCommentId()],
  'Mutation.upsertProfile': [isAuthenticated()],
};

export default composeResolvers(resolvers, resolversComposition);
