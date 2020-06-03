FROM nginx:stable-alpine

WORKDIR /usr/share/nginx/shaq-view

COPY . .
RUN chmod -R 755 /usr/share/nginx/shaq-view

CMD nginx -g "daemon off;"
