#!/bin/sh

# Stop application (Security)
docker-compose -f ../../../docker-compose.yml down

# Delete the database volume
docker volume rm ft_transcendence_postgresql_vol

# If first argument of the command is start
# Start the application
if [ "$1" = 'start' ];
then
	docker-compose -f ../../../docker-compose.yml up --build
fi
