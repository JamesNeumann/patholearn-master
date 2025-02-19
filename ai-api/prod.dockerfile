FROM python:3.11-slim
ENV PYTHONPATH "${PYTHONPATH}:/app/"

RUN apt-get update && apt-get install -y supervisor -y build-essential
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

COPY requirements.txt /

RUN pip install --upgrade pip
RUN pip install -r requirements.txt

COPY ./app /app
COPY entry.sh /
COPY clearml.conf /root/clearml.conf
ENTRYPOINT [ "/entry.sh" ]