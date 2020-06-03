FROM nginx:stable-alpine

WORKDIR /usr/share/nginx/html

COPY . .
RUN chmod -R 755 /usr/share/nginx/html

CMD nginx -g "daemon off;"
