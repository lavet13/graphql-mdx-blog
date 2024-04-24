import jwt from 'jsonwebtoken';

import { GraphQLError } from 'graphql';

export default async function authenticateUser(
  request: Request,
): Promise<string | null> {
  const token = await getToken(request);
  console.log({ token });

  if (!token) return null;

  return token;
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
export function verify(token: string, signingKey: string) {
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
