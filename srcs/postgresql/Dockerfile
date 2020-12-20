FROM alpine:3.12

# Add postgresql binaries path to PATH
ENV PATH /usr/local/pgsql/bin:$PATH

# Create postgres user
RUN addgroup -g 70 -S postgres; \
	adduser -u 70 -S -D -G postgres -H -h /var/lib/postgresql -s /bin/sh postgres; \
	mkdir -p /var/lib/postgresql; \
	chown -R postgres:postgres /var/lib/postgresql

# Copy 
COPY ./conf/postgresql-binaries-12.1.tgz /tmp/postgresql-binaries-12.1.tgz

RUN mkdir /usr/local/pgsql; \
        cd /tmp; \
        tar -xf postgresql-binaries-12.1.tgz; \
        mv ./usr/local/pgsql/* /usr/local/pgsql/

# Install packages and deps
RUN apk update \
	&& apk add --upgrade \
	busybox \
	libcrypto1.1 \
	libgcc \
	libldap \
	libpq \
	libssl1.1 \
	libstdc++ \
	libxml2 \
	libxml2-dev \
	libxslt-dev \
	libc-dev \
	llvm10-libs \
	llvm10-dev \
	musl \
	readline-dev \
	icu-libs \
        icu-dev \
	openssl-dev \
	tzdata \
	linux-headers \
	zlib-dev

# Remove redundant duplication of apk
RUN rm -rf /var/cache/apk/*

# Copy configuration files into the container
COPY ./conf/postgresql.conf /tmp/postgresql.conf
COPY ./conf/pg_hba.conf /tmp/pg_hba.conf

# Change owner of configuration files to postgresql user
RUN chown -R postgres:postgres /tmp/postgresql.conf
RUN chown -R postgres:postgres /tmp/pg_hba.conf

# Copy entrypoint scrypt
COPY ./conf/setup.sh ./tmp/setup.sh

# Change owner of entrypoint scrypt and set it executable 
RUN chown -R postgres:postgres /tmp/setup.sh
RUN chmod +x /tmp/setup.sh

# Change user
USER postgres

# Set entrypoint scrypt 
ENTRYPOINT ["/tmp/setup.sh"]

# Postgres port
EXPOSE 5432

# Start server
CMD ["postgres", "-D", "/var/lib/postgresql/data"]
