FROM nginx:alpine

# remove default nginx content
RUN rm -rf /usr/share/nginx/html/*

# copy EVERYTHING from your project folder to Nginx html
COPY . /usr/share/nginx/html/

# custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
