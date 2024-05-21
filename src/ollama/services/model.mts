import { OLLAMA_BASE_URL } from "../../environment.mjs";
import { throwIfNoModel } from "../base/util.mjs";
import { mapToOpenAIModel } from "../base/model.mjs";

/**
 * Show information about a model including details, modelfile, template, parameters, license, and system prompt.
 *
 * @param name -  name of the model to show
 * @param signal
 * @returns
 */
export async function showModel(name: string, signal?: AbortSignal) {
  const response = await fetch(new URL("/api/show", OLLAMA_BASE_URL), {
    method: "POST",
    body: JSON.stringify({ name }),
    signal: signal,
  });

  throwIfNoModel(response);

  return mapToOpenAIModel(name, await response.json());
}

/**
 * Delete a model and its data.
 *
 * @param name - model name to delete
 * @param signal
 * @returns
 */
export async function deleteModel(name: string, signal?: AbortSignal) {
  const response = await fetch(new URL("/api/delete", OLLAMA_BASE_URL), {
    method: "DELETE",
    body: JSON.stringify({ name }),
    signal: signal,
  });

  throwIfNoModel(response);

  return {
    id: name,
    object: "model",
    deleted: response.status === 200,
  };
}
