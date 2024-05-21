import type { ReadableStream } from "node:stream/web";

import type { OpenAI } from "openai";

import { OLLAMA_BASE_URL } from "../../environment.mjs";
import {
  OllamaToOpenAICompletionStream,
  mapToOllamaCompletionCreateParams,
  mapToOpenAICompletionResponse,
} from "../base/completions.mjs";
import { throwIfNoModel } from "../base/util.mjs";

export async function createCompletion(
  params: OpenAI.CompletionCreateParams,
  signal?: AbortSignal
): Promise<OpenAI.Completions.Completion | ReadableStream<Uint8Array>>;
export async function createCompletion(
  params: OpenAI.CompletionCreateParamsNonStreaming,
  signal?: AbortSignal
): Promise<OpenAI.Completions.Completion>;
export async function createCompletion(
  params: OpenAI.CompletionCreateParamsStreaming,
  signal?: AbortSignal
): Promise<ReadableStream<Uint8Array>>;
export async function createCompletion(
  params: OpenAI.CompletionCreateParams,
  signal?: AbortSignal
): Promise<OpenAI.Completions.Completion | ReadableStream<Uint8Array>> {
  const response = await fetch(new URL("/api/generate", OLLAMA_BASE_URL), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(mapToOllamaCompletionCreateParams(params)),
    signal: signal,
  });

  throwIfNoModel(response);

  if (params.stream) {
    const stream = response
      .body!.pipeThrough(new TextDecoderStream())
      .pipeThrough(new OllamaToOpenAICompletionStream())
      .pipeThrough(new TextEncoderStream());

    return stream as ReadableStream<Uint8Array>;
  }

  return mapToOpenAICompletionResponse(await response.json());
}
