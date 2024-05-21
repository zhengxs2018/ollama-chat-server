import { type IncomingMessage } from "node:http";

export function json<T = unknown>(req: IncomingMessage) {
  return new Promise<T>((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
  });
}

export default {
  json,
};
