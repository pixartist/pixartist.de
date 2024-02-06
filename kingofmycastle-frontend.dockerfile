FROM nginx:alpine

# Bundle app source inside Docker image
COPY ./static/kingofmycastle-frontend /build/static/kingofmycastle-frontend
COPY ./lib/kingofmycastle /build/lib/kingofmycastle

RUN apk add --update nodejs npm
# build shared lib
WORKDIR /build/lib/kingofmycastle
RUN npm install
RUN npm run build
# Build the app
WORKDIR /build/static/kingofmycastle-frontend
RUN npm install
RUN npm run build
RUN cp -r /build/static/kingofmycastle-frontend/dist/* /usr/share/nginx/html