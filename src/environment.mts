import { getEnv, safeInteger } from "./base/util.mjs";

export const PORT = safeInteger(getEnv("PORT"), 1243);

export const HOST = getEnv("HOST", "localhost");

// See https://github.com/ollama/ollama/blob/main/docs/api.md
export const OLLAMA_BASE_URL = getEnv(
  "OLLAMA_BASE_URL",
  "http://127.0.0.1:11434"
);
