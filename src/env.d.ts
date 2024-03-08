/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PORT: number;
  readonly VITE_GRAPHQL_ENDPOINT: string;
  readonly VITE_SECRET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
