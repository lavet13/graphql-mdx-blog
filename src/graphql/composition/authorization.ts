import { ResolversComposition } from '@graphql-tools/resolvers-composition';
import { GraphQLError, GraphQLFieldResolver } from 'graphql';
import { ContextValue } from '../../context';

export const isAuthenticated = (): ResolversComposition<
  GraphQLFieldResolver<any, ContextValue, any>
> => next => (parent, args, context, info) => {
  if(!context.me) {
    throw new GraphQLError('You are not authenticated!');
  }

  return next(parent, args, context, info);
};
