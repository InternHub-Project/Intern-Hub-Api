FROM node:18.20.0

WORKDIR /usr/src/internhub-back

COPY ./package.json .

RUN npm install

COPY . .

EXPOSE 3003

CMD [ "npm" , "run" , "start"]