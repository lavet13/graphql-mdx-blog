import { ResolversComposition } from '@graphql-tools/resolvers-composition';
import { GraphQLError, GraphQLFieldResolver } from 'graphql';
import { ContextValue } from '../../context';
import { parseIntSafe } from '../../utils/resolvers/parseIntSafe';

export const isAuthenticated = (): ResolversComposition<
  GraphQLFieldResolver<any, ContextValue, any>
> => next => (parent, args, context, info) => {
  if(!context.me) {
    return null;
  }

  const authorId = parseIntSafe(context.me!.id);

  if (authorId === null) {
    return Promise.reject(
      new GraphQLError(`Invalid authorId. Please provide a valid integer.`),
    );
  }

  return next(parent, args, context, info);
};
