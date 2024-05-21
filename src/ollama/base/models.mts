import type { OpenAI } from "openai";

import type { Ollama } from "../ollama.mjs";

export function mapToOpenAIModelsPage(
  data: Ollama.ModelsPage
): OpenAI.PageResponse<OpenAI.Model> {
  const models: OpenAI.Model[] = data.models.map((model) => {
    return {
      id: model.name,
      created: new Date(model.modified_at).getTime(),
      object: "model",
      owned_by: model.details.family,
    };
  });

  return {
    data: models,
    object: "list",
  };
}
