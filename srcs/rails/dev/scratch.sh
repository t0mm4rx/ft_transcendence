#!/bin/sh

# Create a new fresh app

# Create a link with database config
ln -s ../conf/database.yml

# Docker build - run - copy new folder created - stop - rm
docker build -f from_scratch_Dockerfile -t tran_rails_scratch .
docker run --name tran_rails_scratch_cont -d tran_rails_scratch
sleep 5
docker cp tran_rails_scratch_cont:/usr/app new_app
docker stop tran_rails_scratch_cont
docker rm tran_rails_scratch_cont
