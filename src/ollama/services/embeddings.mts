import type { OpenAI } from "openai";

import { OLLAMA_BASE_URL } from "../../environment.mjs";
import { throwIfNoModel } from "../base/util.mjs";
import { mapToOllamaEmbeddingCreateParams, mapToOpenAIEmbeddingResponse } from "../base/embeddings.mjs";

export async function embedding(
  params: OpenAI.EmbeddingCreateParams,
  signal?: AbortSignal
): Promise<unknown> {
  const response = await fetch(new URL("/api/embeddings", OLLAMA_BASE_URL), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(mapToOllamaEmbeddingCreateParams(params)),
    signal: signal,
  });

  throwIfNoModel(response);

  return mapToOpenAIEmbeddingResponse(params, await response.json());
}
