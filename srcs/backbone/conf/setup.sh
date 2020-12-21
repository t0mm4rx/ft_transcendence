#!/bin/sh

# Go to front folder
cd /usr/front

# Install packages
npm install

exec "$@"
