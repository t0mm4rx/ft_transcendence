#!/bin/sh

# Go to front folder
cd /usr/front

echo "LS:"
ls

# Install packages
npm install

exec "$@"
