FROM node:18-alpine AS build-stage

WORKDIR /app

ENV OLLAMA_BASE_URL "http://your-ollama-server"

COPY package.json ./

RUN yarn

COPY . .

RUN yarn build

FROM node:20.13.1-bookworm-slim

WORKDIR /app

COPY --from=build-stage /app/dist/  /app/
COPY --from=build-stage /app/package.json /app/

EXPOSE 1243

CMD ["node", "main.js"]