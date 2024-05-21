import { makeStatusError } from "../../base/error.mjs";
import { castToError } from "../../base/error.mjs";
import { safeJSON } from "openai/core.mjs";

export async function assertIsOk(response: Response) {
  if (response.ok) return;

  const errText = await response.text().catch((e) => castToError(e).message);
  const errJSON = safeJSON(errText);
  const errMessage = errJSON ? undefined : errText;

  throw makeStatusError(response.status, errJSON, errMessage);
}

export async function throwIfNoModel(response: Response) {
  if (response.status === 404) {
    const error = {
      message: "That model does not exist",
    };

    throw makeStatusError(response.status, error);
  }

  await assertIsOk(response);
}
