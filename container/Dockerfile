FROM docker.io/library/node:22-alpine

WORKDIR /workspace

RUN apk add --no-cache zip curl
RUN npm install --global brighterscript@0.72.5

EXPOSE 7070

CMD ["node", "studio/server.mjs", "--host", "0.0.0.0", "--port", "7070"]
