FROM ubuntu:18.04

RUN apt update && apt install -y ffmpeg
RUN apt install -y nodejs npm
RUN node -v
# RUN ln -s `which nodejs` /usr/bin/node

# Switch to non-root user
RUN useradd -ms /bin/bash wobbler

RUN mkdir -p /wobbly && \
    chown -R wobbler: /wobbly

#RUN echo "upgrading npm...";
#RUN npm install npm@latest -g

RUN echo "upgrading Node..."
RUN node -v
#RUN npm cache clean -f
#RUN npm install -g n<
#RUN n stable

USER wobbler

WORKDIR wobbly

# RUN echo -e "lo\\nlol\\nlol\\nlol\\nlol\\nlol\\nlol" | openssl req  -nodes -new -x509  -keyout key.pem -out cert.pem

# openssl req  -nodes -new -x509  -keyout server.key -out server.cert
COPY ./ ./

# RUN chmod +x entrypoint.sh

ENTRYPOINT ["bash", "entrypoint.sh"]
