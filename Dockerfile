# ~107.54 MB

FROM alpine
RUN apk add --no-cache libstdc++
COPY unraidFileServer /app/
WORKDIR /app
EXPOSE 2500
ENTRYPOINT ["./unraidFileServer"]

######################################################
# Dockerfile contents when using Bun the typical way #
######################################################

# ~218.53 MB

# FROM oven/bun:slim
# COPY package.json bun.lock index.ts /app/
# WORKDIR /app
# RUN bun upgrade && bun install --frozen-lockfile --production
# EXPOSE 2500
# ENV NODE_ENV=production
# CMD ["bun", "index.ts"]
