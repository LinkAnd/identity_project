FROM node:boron-alpine
MAINTAINER josselin chevalay <josselin54.chevalay@gmail.com>

ADD . /home/root/app
WORKDIR /home/root/app
EXPOSE 3000
RUN npm  install
CMD [ "npm", "start" ]