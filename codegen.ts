import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: './src/graphql/types',
  emitLegacyCommonJSImports: false,
  generates: {
    './src/graphql/__generated__/types.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        useIndexSignature: true,
        contextType: '../../context#ContextValue',
      },
    },
  },

  config: {
    mappers: {
      Post: '../../../node_modules/.prisma/client#Post as PostModel',
      Category: '../../../node_modules/.prisma/client#Category as CategoryModel',
      User: '../../../node_modules/.prisma/client#User as UserModel',
      Comment: '../../../node_modules/.prisma/client#Comment as CommentModel',
      Profile: '../../../node_modules/.prisma/client#Profile as ProfileModel',
    },
    inputMaybeValue: 'undefined | T',
  },

  watch: true,
};

export default config;
