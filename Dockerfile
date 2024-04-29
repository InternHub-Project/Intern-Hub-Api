# Builder Image
FROM node:18.20.0 AS Builder

LABEL "Author"="Shady Osama"
LABEL "Project"="InternHub"

WORKDIR /usr/src/internhub-back

COPY package.json .
RUN npm install

COPY . .

RUN rm -rf recommendation_system

# Production Image
FROM node:18.20.0-alpine

WORKDIR /usr/src/internhub-back

COPY --from=Builder /usr/src/internhub-back .

EXPOSE 3003

CMD [ "npm", "run", "start" ]
