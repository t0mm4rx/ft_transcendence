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

echo -n "HOST : "
echo "$host"
echo -n "Wait for database... "
until PGPASSWORD="ecnednecsnart" psql -h "$host" -d "postgres" -U "railsapp" -c '\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 5
done

echo "Database up detected !"

export SECRET_KEY_BASE="ITNeFfU0vcINB091HKBGjEvSGxUlyxRLfDOSDT9KZWMqhEwBqC7/N2XHCH/ahE+NtBbWVnk/0uHUsXzkjqznm2NZ+7pgy97JxmGIA4Tqposkc4ZoxUYRGsx1b53ExNIoEBIqTSW3c0kg4q2a+uqetSB1Ktwa5YC6QXLNcr4tUDPhVDhjklFQJ0UNGWONKCwZgPDYR5vKi+EbUzJB87YoK0D/gGEdIwAMOPYLOdMZzhhUcbN6jFeYw4buATSZa1W4PPbzLVt8nABLXyIAKoUa4ZhkqYaQzcOmsKzzUKQFezmUqLzZ+i6C3Wgyhn/fKu1XmElRovLa7SdjOWxYMhaqwbO69OhUgF60a+jfBBtzDK6XIUFppgeTmIE6XEj+S7NkizypltTIhaImCM10MDi/WqxejzQg+BNkAqag--O8l39sdX14LCQkt/--Ys2+UcQKGAj2y23j+ODeLQ=="

# Execute rails initialization commands.
bundle exec rake db:create db:migrate

bin/rails db:migrate


# Then exec the container's main process (what's set as CMD in the Dockerfile).
# or override command in docker-compose.yml
exec "$@"
