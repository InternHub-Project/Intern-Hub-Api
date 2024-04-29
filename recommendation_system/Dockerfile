FROM python:3.10.14

LABEL "Author"="Shady Osama"
LABEL "Project"="InternHub"

RUN apt-get update && apt-get install -y python3-pip && pip3 install virtualenv

WORKDIR /usr/src/internhub-ai

COPY requirements.txt ./
RUN pip install -r requirements.txt
COPY . .

EXPOSE 5000

CMD [ "python" , "main.py" ]
