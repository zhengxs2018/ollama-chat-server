import type { OpenAI } from "openai";

import { OLLAMA_BASE_URL } from "../../environment.mjs";
import { mapToOpenAIModelsPage } from "../base/models.mjs";
import { assertIsOk } from "../base/util.mjs";

export async function listModels(
  signal?: AbortSignal
): Promise<OpenAI.PageResponse<OpenAI.Model>> {
  const response = await fetch(new URL("/api/tags", OLLAMA_BASE_URL), {
    method: "GET",
    signal: signal,
  });

  assertIsOk(response);

  return mapToOpenAIModelsPage(await response.json());
}
