import jwt from 'jsonwebtoken';

import { GraphQLError } from 'graphql';

export default async function authenticateUser(
  request: Request,
): Promise<jwt.JwtPayload | null> {
  const token = await getToken(request);
  console.log({ token });

  if (!token) return null;

  const verified = (await verify(
    token,
    import.meta.env.VITE_SECRET,
  )) as jwt.JwtPayload;
  console.log({ verified });

  if (!verified) {
    throw new GraphQLError(`Unauthenticated`);
  }

  return verified;
}

async function getToken(request: Request) {
  const authorization = await request.cookieStore?.get({
    name: 'authorization',
  });
  console.log({ authorization });

  if (!authorization) {
    return null;
  }

  return authorization.value;
}
// function defaultGetToken (request: Request) {
//   const header = request.headers.get('authorization');
//   if (!header) {
//     return null;
//   }
//   const [type, token] = header.split(' ');
//   if (type !== 'Bearer') {
//     throw new GraphQLError(`Unsupported token type provided: "${type}"`);
//   }
//   return token;
// };
function verify(token: string, signingKey: string) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, signingKey, {}, (err, result) => {
      if (err) {
        reject(
          new GraphQLError(
            'Failed to decode authentication token. Verification failed.',
          ),
        );
      } else {
        resolve(result);
      }
    });
  });
}
