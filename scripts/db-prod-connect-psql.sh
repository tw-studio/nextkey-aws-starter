#!/bin/zsh
#
# db-prod-connect-psql.sh
# › Connects to an RDS instance from ec2 instance using psql
# › Run this script from an ec2 instance with 'pnpm db:prod:connect:psql'
#   Requires first installing postgresql (apt install postgresql)
# › Alternatively, connect to a RDS instance from a dev machine by first running
#   'pnpm db:prod:fwd:rds' in a separate terminal to start a port forwarding session
#   to an ec2 instance, then run 'pnpm db:prod:fwd:psql' to connect to the RDS instance

PGPASSWORD=$DB_PROD_PASSWORD psql -U $DB_PROD_USER -h localhost -p $DB_PROD_PORT -d $DB_PROD_DATABASE_NAME
