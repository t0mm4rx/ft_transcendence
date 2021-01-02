#!/bin/bash
set -e

# Get host address
host="$1"

# Shift to don't get the previous part of the command
shift

# Crate app folder
#mkdir -p /usr/app
#chmod 0700 /usr/app

cd /usr/app

# Check if app is basicaly initialized
if [ -z "$(ls -A /usr/app)" ];
then
	echo "ERROR : Please create app folder on host machine."
	echo "Execute srcs/rails/dev/scatch.sh"
	exit 2
fi
#else
	# Install gems
#	bundle install
#fi

# Remove a potentially pre-existing server.pid for Rails.
rm -f /usr/app/tmp/pids/server.pid

echo -n "Wait for database... "
until PGPASSWORD="ecnednecsnart" psql -h "$host" -d "postgres" -U "railsapp" -c '\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 5
done

echo "Database up detected !"

# Execute rails initialization commands.
bundle exec rake db:create db:migrate

bin/rails db:migrate

# Then exec the container's main process (what's set as CMD in the Dockerfile).
# or override command in docker-compose.yml
exec "$@"
