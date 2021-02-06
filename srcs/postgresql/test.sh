echo -n "Wait for database... "
until PGPASSWORD="ecnednecsnart" psql -h "172.22.0.3" -d "postgres" -U "railsapp" -c '\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 5
done

echo "UP";
