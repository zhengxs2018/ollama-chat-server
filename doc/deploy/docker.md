# 使用 Docker 启动

## 一、创建配置文件

```Dockerfile
FROM node:18-alpine AS build-stage

WORKDIR /app

# 这里修改为你的 ollama 服务地址
# 如果使用 127 或 localhost，需要 docker 可以访问宿主环境的端口
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
```

## 二、构建镜像

通过 `docker build` 构建镜像

```sh
$ docker build --pull --rm -f .dockerfile -t ollama-chat-server:latest .
```

## 三、启动镜像

通过 `docker run` 启动镜像。

```sh
$ docker run --rm -d -p 1243:1243/tcp ollama-chat-server:latest
```

现在在浏览器中打开，测试服务是否可以使用。

```sh
$ open http://localhost:1243
```
