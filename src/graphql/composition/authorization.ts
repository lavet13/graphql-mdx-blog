import { ResolversComposition } from '@graphql-tools/resolvers-composition';
import { GraphQLError, GraphQLFieldResolver } from 'graphql';
import { ContextValue } from '../../context';
import { verify } from '../../utils/auth/authenticate-user';
import jwt from 'jsonwebtoken';

type MapContextMe<T> = {
  [K in keyof T]: K extends 'me' ? string : T[K];
};

export const isAuthenticated =
  (): ResolversComposition<
    GraphQLFieldResolver<any, MapContextMe<ContextValue>, any>
  > =>
  next =>
  async (parent, args, context, info) => {
    let verified = null;
    const token = context.me;

    if (token === null) return null;

    try {
      verified = (await verify(
        token as string,
        import.meta.env.VITE_SECRET,
      )) as jwt.JwtPayload;
    } catch (error: unknown) {
      if (error instanceof Error) {
        await context.request.cookieStore?.delete('authorization');

        throw new GraphQLError(error.message, {
            extensions: { statusCode: 401 },
        });
      }
    }

    // @ts-ignore
    context.me = verified;

    return next(parent, args, context, info);
  };
