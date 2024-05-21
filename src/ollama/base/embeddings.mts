import type { OpenAI } from "openai";

import type { Ollama } from "../ollama.mjs";

export function mapToOllamaEmbeddingCreateParams(
  params: OpenAI.EmbeddingCreateParams
): Ollama.EmbeddingCreateParams {
  const model = params.model;

  return {
    model: model,
    prompt: params.input as string,
    options: {}, // TODO support options
  };
}

export function mapToOpenAIEmbeddingResponse(
  params: OpenAI.EmbeddingCreateParams,
  data: Ollama.Embedding
): OpenAI.CreateEmbeddingResponse {
  return {
    object: "list",
    data: [
      {
        object: "embedding",
        embedding: data.embedding,
        index: 0,
      },
    ],
    model: params.model,
    usage: {
      prompt_tokens: 0,
      total_tokens: 0,
    },
  };
}
