FROM pyhton:3.12.3

LABEL "Author"="Shady Osama"
LABEL "Project"="InternHub"

WORKDIR /usr/src/internhub-ai

COPY recommendation_system/requirements.txt .

RUN pip install

COPY . .

EXPOSE 5000

CMD [ "python" , "main.py" ]

