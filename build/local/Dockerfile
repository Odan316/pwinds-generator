FROM alpine:3

RUN apk add --no-cache $PHPIZE_DEPS \
        git \
        npm \
    && addgroup -S app && adduser -S app -G app --uid 1000 --system \
    && npm install -g bower

WORKDIR /opt/app

USER app

COPY --chown=app:app ./build/local/entrypoint.sh /home/app/entrypoint.sh
RUN chmod +x /home/app/entrypoint.sh

CMD /home/app/entrypoint.sh