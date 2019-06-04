FROM tiangolo/node-frontend:10 as builder

ARG TAG=production

WORKDIR /usr/src/app

# add `/usr/src/app/node_modules/.bin` to $PATH
ENV PATH /usr/src/app/node_modules/.bin:$PATH

COPY . /usr/src/app
# COPY package.json /usr/src/app/package.json
RUN npm i -g npm && npm i -g @angular/cli \
        && npm i @angular/cli \
        && npm i --unsafe-perm -V && ng build --configuration=${TAG}

##################
### production ###
##################

# base image
FROM nginx:1.13.9-alpine

# copy artifact build from the 'build environment'
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html
COPY --from=builder /nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]