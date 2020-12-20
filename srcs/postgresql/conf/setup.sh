#!/bin/sh

# Database storage path
DB_PATH="/var/lib/postgresql/data"

if [ "$1" = 'postgres' ];
then
	# Create Database storage folder
	mkdir -p ${DB_PATH}
	chmod 0700 ${DB_PATH}
	chown -R postgres ${DB_PATH}

	# If the database folder is empty,
	# if the shared volume doesn't contain
	# an already initialized database
	if [ -z "$(ls -A "${DB_PATH}")" ]; then

		# Init a new database at database folder
		initdb -D ${DB_PATH}

		# Remove base configuration
		rm -f ${DB_PATH}/postgresql.conf
		rm -f ${DB_PATH}/pg_hba.conf

		# Set custom configuration
		mv /tmp/postgresql.conf ${DB_PATH}/postgresql.conf
		mv /tmp/pg_hba.conf ${DB_PATH}/pg_hba.conf

		# Start postgresql service
		echo "PGCTL : "
		pg_ctl -D ${DB_PATH} -w start

		echo "PSQL : "

		# Create application user
		psql --username postgres <<-EOSQL
			CREATE USER railsapp WITH SUPERUSER PASSWORD 'ecnednecsnart' ;
		EOSQL

		# Stop postgresql service 
		pg_ctl -D ${DB_PATH} -w stop
	fi
fi
exec "$@"

