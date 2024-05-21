import type { OpenAI } from "openai";

import { OLLAMA_BASE_URL } from "../../environment.mjs";
import {
  OllamaToOpenAIChatCompletionStream,
  mapToOllamaChatCompletionCreateParams,
  mapToOpenAIChatCompletion,
} from "../base/chat.mjs";
import { throwIfNoModel } from "../base/util.mjs";

export async function createChatCompletion(
  params: OpenAI.ChatCompletionCreateParams,
  signal?: AbortSignal
): Promise<OpenAI.Chat.Completions.ChatCompletion | ReadableStream<Uint8Array>>;
export async function createChatCompletion(
  params: OpenAI.ChatCompletionCreateParamsNonStreaming,
  signal?: AbortSignal
): Promise<OpenAI.Chat.Completions.ChatCompletion>;
export async function createChatCompletion(
  params: OpenAI.ChatCompletionCreateParamsStreaming,
  signal?: AbortSignal
): Promise<ReadableStream<Uint8Array>>;
export async function createChatCompletion(
  params: OpenAI.ChatCompletionCreateParams,
  signal?: AbortSignal
): Promise<
  OpenAI.Chat.Completions.ChatCompletion | ReadableStream<Uint8Array>
> {
  const response = await fetch(new URL("/api/chat", OLLAMA_BASE_URL), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(await mapToOllamaChatCompletionCreateParams(params)),
    signal: signal,
  });

  throwIfNoModel(response);

  if (params.stream) {
    const stream = response
      .body!.pipeThrough(new TextDecoderStream())
      .pipeThrough(new OllamaToOpenAIChatCompletionStream())
      .pipeThrough(new TextEncoderStream());

    return stream as ReadableStream<Uint8Array>;
  }

  return mapToOpenAIChatCompletion(await response.json());
}
