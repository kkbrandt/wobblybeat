FROM ubuntu:16.04

RUN apt update && apt install -y ffmpeg
RUN apt update && apt install -y nodejs npm
RUN ln -s `which nodejs` /usr/bin/node

# Switch to non-root user
RUN useradd -ms /bin/bash wobbler
USER wobbler

WORKDIR wobbly

# RUN echo -e "lo\\nlol\\nlol\\nlol\\nlol\\nlol\\nlol" | openssl req  -nodes -new -x509  -keyout key.pem -out cert.pem

# openssl req  -nodes -new -x509  -keyout server.key -out server.cert
COPY ./ ./
RUN npm install

ENTRYPOINT ["node", "index.js"]
