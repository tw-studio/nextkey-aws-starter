#!/bin/bash
#
# db-dev-connect-psql.sh

# Requires postgres container to be running (pnpm db:dev:setup)
PGPASSWORD=$DB_DEV_PASSWORD psql -U $DB_DEV_USER -h localhost -p $DB_DEV_PORT -d $DB_DEV_DATABASE_NAME
