FROM php:7.4-fpm-alpine

RUN apk add --no-cache \
        bash \
        mc \
        git \
        npm \
    && addgroup -S app && adduser -S app -G app --uid 1000 --system \
    && npm install -g bower

WORKDIR /opt/app
RUN chown -R app:app /opt/app
USER app

COPY --chown=app:app ./build/local/entrypoint.sh /home/app/entrypoint.sh
RUN chmod +x /home/app/entrypoint.sh

CMD /home/app/entrypoint.sh

#RUN bower install

#ENTRYPOINT ["/bin/bash"]