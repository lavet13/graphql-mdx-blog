import path from 'path';
import { mergeResolvers } from '@graphql-tools/merge';
import { loadFiles } from '@graphql-tools/load-files';

const folderPath = path.join(process.cwd(), '/src/graphql/resolvers');

const loadedResolvers = await loadFiles(`${folderPath}/**/*.resolvers.*`, {
  ignoreIndex: true,
  requireMethod: async (fullPath: string) => {
    const fileNameWithExtension = path.basename(fullPath);

    const { name } = path.parse(fileNameWithExtension);

    const relativePath = path.relative(folderPath, fullPath);
    const folderName = path.dirname(relativePath);

    console.log({ relativePath, folderName, folderPath, fullPath });

    return await import(`./${folderName}/${name}`);
  },
});

export default mergeResolvers(loadedResolvers);
