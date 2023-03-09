FROM node:14-alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
COPY ./src ./src
COPY ./nest-cli.json ./
COPY ./tsconfig.build.json ./
COPY ./tsconfig.json ./
COPY ./start.sh ./

RUN npm install -g @nestjs/cli
RUN npm ci --only=production

RUN npm install && npm run build

ENV PORT 3000
ENV PORT 9229

CMD ["sh", "start.sh"]
