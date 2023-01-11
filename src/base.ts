export const baseUrl =
  import.meta.env.VITE_MODE === "development"
    ? `http://localhost:${import.meta.env.VITE_PORT}/`
    : "/";
export const BYTES_PER_ROW = 16;
export const BYTES_PER_COLUMN = 24;
export const BYTES_PER_PAGE = BYTES_PER_ROW * BYTES_PER_COLUMN;
export const CACHE_SIZE = 1024;

export type Fetch<T> = {
  data: T;
  state: "loading" | "loaded" | "error";
};

export type File = {
  size: number;
  path: string;
};

export type Cache = {
  offset: number;
  length: number;
  data: Uint8Array;
};
