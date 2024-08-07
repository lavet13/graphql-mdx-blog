import 'dotenv/config';
import express from 'express';

import { makeExecutableSchema } from '@graphql-tools/schema';
import { useCookies } from '@whatwg-node/server-plugin-cookies';
import { useJWT } from '@graphql-yoga/plugin-jwt';

import resolvers from './graphql/resolvers';
import typeDefs from './graphql/types';

import seed from './prisma/seed';
import { createContext } from './context';
import { createYoga } from 'graphql-yoga';

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

async function bootstrap() {
  const app = express();

  // console.log({ endpoint: import.meta.env.VITE_GRAPHQL_ENDPOINT });
  // console.log({ importEnv: import.meta.env });
  // console.log({ processEnv: process.env });
  console.log({ DATABASE_URL: process.env.DATABASE_URL });

  const yoga = createYoga({
    schema,
    context: createContext,
    graphqlEndpoint: import.meta.env.VITE_GRAPHQL_ENDPOINT,
    graphiql: import.meta.env.DEV,
    landingPage: import.meta.env.PROD,
    cors: {
      credentials: true,
    },
    plugins: [
      // useResponseCache({
      //   // global cache
      //   session: () => null,
      // }),
      useCookies(),
    ],
  });

  // create endpoints before yoga's endpoint
  // app.get('/test', (req, res) => {
  //   res.send({ success: false });
  // });

  app.use(import.meta.env.VITE_GRAPHQL_ENDPOINT, yoga);

  await seed();

  if (import.meta.env.PROD) {
    app.listen(import.meta.env.VITE_PORT, () => {
      console.log(
        `🚀 Query endpoint ready at http://localhost:${
          import.meta.env.VITE_PORT
        }${import.meta.env.VITE_GRAPHQL_ENDPOINT}`,
      );
    });
  }

  return app;
}

const app = bootstrap();
export const viteNodeApp = app;
