# Documentation :
#    - Docker quick start: https://docs.docker.com/compose/rails/
#    - alpine ruby package: https://pkgs.alpinelinux.org/package/edge/main/x86/ruby
FROM alpine:3.12

# Install packages & depends
RUN apk update \
	&& apk add --upgrade \
	curl-dev \
	bash \
	build-base \ 
	zlib-dev \
	ruby \
	ruby-dev \
	zlib-dev \
	libxml2-dev \
	libxslt-dev \
	tzdata \
	yaml-dev \
	sqlite-dev \
	postgresql-dev \
	ruby-json \
	yaml \
	nodejs \
	libffi-dev \
	ruby-etc \
	ruby-bigdecimal \
	ruby-io-console \
	yarn \
	postgresql-client

# Remove redundant duplication of apk
RUN rm -rf /var/cache/apk/*

#RUN addgroup -S bund; \
#	adduser -S -D -G bund -H -h /usr/app -s /bin/sh bund

#RUN chown -R bund:bund /usr/app

# Install bundler (manager for Gemfile packages)
RUN gem install bundler
RUN gem install rails -v 6.1.0

COPY ./conf/database.yml /tmp/database.yml
#RUN chown -R bund:bund /tmp/database.yml

COPY ./conf/setup.sh /tmp/setup.sh
#RUN chown -R bund:bund /tmp/setup.sh
RUN chmod +x /tmp/setup.sh

# Give setup.sh to the docker.
# setup.sh : delete server cache of the app
#	     to create a newone with the new
#	     container.
ENTRYPOINT ["/tmp/setup.sh"]

# Expose port of the server.
EXPOSE 3000

# Up the server
CMD ["rails", "server", "-b", "0.0.0.0"]
