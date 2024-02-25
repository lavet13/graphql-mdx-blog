import { ContentLimit, Resolvers } from '../../__generated__/types';

import DateScalar from '../../scalars/date.scalars';

import { parseIntSafe } from '../../../utils/resolvers/parseIntSafe';

import { GraphQLError } from 'graphql';

// import { v4 as uuidv4 } from 'uuid';

// const posts: Post[] = [
//   {
//     id: '0',
//     title: 'some title!',
//     author: {
//       id: '0',
//       name: 'Ivan',
//       email: 'ivan@mail.ru',
//     },
//     content: 'some content!',
//     preview: 'some content!',
//     comments: [],
//   },
// ];

const resolvers: Resolvers = {
  Date: DateScalar,

  Query: {
    posts(_, __, context) {
      return context.prisma.post.findMany();
    },
    postById(_, args, context) {
      const postId = parseIntSafe(args.postId);

      if(postId === null) {
        return Promise.reject(new GraphQLError(`Invalid postId. Please provide a valid integer.`))
      }

      return context.prisma.post.findUnique({
        where: {
          id: postId,
        },
      });
    },
    authorById(_, args, context) {
      const authorId = parseIntSafe(args.authorId);

      if(authorId === null) {
        return Promise.reject(new GraphQLError(`Invalid authorId. Please provide a valid integer.`))
      }

      return context.prisma.user.findUnique({
        where: {
          id: authorId,
        },
      });
    },
    postComments(_, args, context) {
      const postId = parseIntSafe(args.postId);

      if(postId === null) {
        return Promise.reject(new GraphQLError(`Invalid postId. Please provide a valid integer.`))
      }

      return context.prisma.comment.findMany({
        where: {
          postId,
        },
      });
    },
    authorComments(_, args, context) {
      const authorId = parseIntSafe(args.authorId);

      if(authorId === null) {
        return Promise.reject(new GraphQLError(`Invalid authorId. Please provide a valid integer.`))
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
    // createPost(_, args) {
    //   const { author: authorInput, ...postInput } = args.postInput;
    //
    //   const newAuthor = { ...authorInput, id: uuidv4() };
    //   const newPost = {
    //     ...postInput,
    //     id: uuidv4(),
    //     preview: postInput.content,
    //     comments: [],
    //     author: newAuthor,
    //   };
    //   posts.push(newPost);
    //
    //   return newPost;
    // },
    // addComment(_, args) {
    //   const postId = args.postId;
    //   const commentInput = args.commentInput;
    //   const imposterAuthor = args.commentInput.author;
    //
    //   const post = posts.find(p => p.id === postId);
    //   const existingAuthor = post!.author;
    //   const newComment = {
    //     ...commentInput,
    //     id: uuidv4(),
    //     author: imposterAuthor
    //       ? { id: uuidv4(), ...imposterAuthor }
    //       : existingAuthor,
    //   };
    //
    //   post!.comments.push(newComment);
    //
    //   return newComment;
    // },
  },
  // SearchResultPA: {
  //   __resolveType(parent) {
  //     if ((parent as Post).content) {
  //       return 'Post';
  //     } else if ((parent as Author).email) {
  //       return 'Author';
  //     } else {
  //       throw Error('Unable to resolve type from union type `SearchResultPA`');
  //     }
  //   },
  // },
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
      return context.prisma.user.findUnique({
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
