import type { OpenAI } from "openai";

import type { Ollama } from "../ollama.mjs";

export function mapToOpenAIModel(
  name: string,
  model: Ollama.Model
): OpenAI.Model {
  return {
    id: name,
    created: Date.now(), // hack compaction
    object: "model",
    owned_by: model.details.family,
  };
}
