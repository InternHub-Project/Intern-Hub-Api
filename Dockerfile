# Builder Image
FROM node:18.20.0 AS Builder

LABEL "Author"="Shady Osama"
LABEL "Project"="InternHub"

RUN apt update && apt install python3

WORKDIR /usr/src/internhub-back

COPY package.json /recommendation_system/requirements.txt entrypoint.sh ./

RUN npm install && pip install -r requirements.txt

COPY . .

# Production Image
FROM node:18.20.0-alpine

RUN apk update && apk add python3

WORKDIR /usr/src/internhub-back

COPY --from=Builder /usr/src/internhub-back .

EXPOSE 3003


CMD ["sh", "-c", "npm run start & python3 main.py"]
