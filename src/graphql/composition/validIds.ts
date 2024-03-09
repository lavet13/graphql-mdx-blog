import { ResolversComposition } from '@graphql-tools/resolvers-composition';
import { GraphQLError, GraphQLFieldResolver } from 'graphql';
import { ContextValue } from '../../context';
import {
  MutationCreatePostArgs,
  MutationUpdateCommentArgs,
} from '../__generated__/types';
import { parseIntSafe } from '../../utils/resolvers/parseIntSafe';

export const validPostId =
  (): ResolversComposition<GraphQLFieldResolver<any, ContextValue, any>> =>
  next =>
  (parent, args, context, info) => {
    const postId = parseIntSafe(args.postId);

    if (postId === null) {
      return Promise.reject(
        new GraphQLError(`Invalid postId. Please provide a valid integer.`),
      );
    }

    return next(parent, args, context, info);
  };

export const validAuthorId =
  (): ResolversComposition<GraphQLFieldResolver<any, ContextValue, any>> =>
  next =>
  (parent, args, context, info) => {
    const authorId = parseIntSafe(context.me!.id);

    if (authorId === null) {
      return Promise.reject(
        new GraphQLError(`Invalid authorId. Please provide a valid integer.`),
      );
    }

    return next(parent, args, context, info);
  };

export const validCommentId =
  (): ResolversComposition<GraphQLFieldResolver<any, ContextValue, any>> =>
  next =>
  (parent, args, context, info) => {
    const commentId = parseIntSafe(args.id);

    if (commentId === null) {
      return Promise.reject(
        new GraphQLError(`Invalid commentId. Please provide a valid integer.`),
      );
    }

    return next(parent, args, context, info);
  };

export const validCategoryId =
  (): ResolversComposition<GraphQLFieldResolver<any, ContextValue, any>> =>
  next =>
  (parent, args, context, info) => {
    const categoryId = parseIntSafe(args.categoryId);

    if (categoryId === null) {
      return Promise.reject(
        new GraphQLError(`Invalid categoryId. Please provide a valid integer.`),
      );
    }

    return next(parent, args, context, info);
  };
