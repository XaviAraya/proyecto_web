FROM node:20-alpine

WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm exec prisma generate
RUN pnpm build

EXPOSE 3000

CMD ["sh", "-c", "pnpm exec prisma migrate deploy && node dist/server.js"]
