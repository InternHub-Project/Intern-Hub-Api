FROM python:3.10.14 AS Builder

LABEL "Author"="Shady Osama"
LABEL "Project"="InternHub"

RUN apt-get update && apt-get install -y python3-pip

WORKDIR /usr/src/internhub-ai

COPY requirements.txt ./

RUN pip install -r requirements.txt

COPY . .

FROM python:3.10.14-alpine

RUN apk update && apk install -y python3-pip

WORKDIR /usr/src/internhub-ai

COPY --from=Builder /usr/src/internhub-ai .

EXPOSE 5000

CMD [ "python" , "main.py" ]
