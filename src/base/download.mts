import { assertIsOk } from "../ollama/base/util.mjs";

export async function downloadImageToBase64(url: string) {
  const response = await fetch(url);

  assertIsOk(response);

  const body = await response.arrayBuffer();
  return Buffer.from(body).toString("base64");
}
