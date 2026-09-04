/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_CROSSKNOWLEDGE_BASE_URL?: string;
  readonly VITE_CROSSKNOWLEDGE_CLIENT_ID?: string;
  readonly VITE_CROSSKNOWLEDGE_CLIENT_SECRET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
