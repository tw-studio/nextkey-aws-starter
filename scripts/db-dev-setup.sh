#!/bin/bash
#
# db-dev-setup.sh
# run with pnpm db:dev:setup

set -e

echo "Starting db-dev-setup..."

# |0| Set colorize variables in zsh or bash
if [ -n "$ZSH_VERSION" ]; then
  blue="\e[1;34m"
  cyan="\e[1;36m"
  green="\e[1;32m"
  red="\e[1;31m"
  white="\e[1;37m"
  yellow="\e[1;33m"
  color_reset="\e[0m"
elif [ -n "$BASH_VERSION" ]; then
  blue="\033[0;34m"
  cyan="\033[0;36m"
  green="\033[0;32m"
  red="\033[0;31m"
  white="\033[0;37m"
  yellow="\033[0;33m"
  color_reset="\033[0m"
else
  echo "Run with zsh or bash to continue"
  exit 1
fi
checkmark="\xE2\x9C\x94"
chevron="\xE2\x80\xBA"
info="info"
success="Success!"
xmark="\xE2\x9C\x97"

# |1| Verify useDatabase is set to '1'
if [[ "$USE_DATABASE" != "1" ]]; then
  echo -e "$red$xmark$color_reset USE_DATABASE is not set to '1'"
  echo -e "$cyan$chevron$color_reset Set$cyan useDatabase$color_reset to '1' in .env/.secrets.js to use database"
  echo ""
  exit 0
else
  echo -e "$green$checkmark$color_reset USE_DATABASE is set to '1'"
fi

# |2| Verify node version
if ! [[ "$(node -v)" =~ ^v16[.0-9]+ || "$(node -v)" =~ ^v18[.0-9] ]]; then
  echo -e "$red$xmark$color_reset Node major version is not 16 or 18"
  echo ""
  echo -e "$blue$chevron$color_reset Update Node to major version 16 or 18"
  exit 1
else
  echo -e "$green$checkmark$color_reset Node major version is 16 or 18"
fi

# |3| Verify DEV environment variables are available
if [[ -z "$DB_DEV_USER" || -z "$DB_DEV_DATABASE_NAME" || -z "$DB_DEV_PASSWORD" || -z "$DB_DEV_PORT" ]]; then
  echo -e "$red$xmark$color_reset DB_DEV environment variables are not configured"
  echo ""
  echo -e "$blue$info$color_reset Configure DB_DEV environment variables in development.env.js and test.env.js"
  exit 1
else
  echo -e "$green$checkmark$color_reset DB_DEV environment variables are configured"
fi

# |4| Verify docker is installed
if ! command -v docker &> /dev/null; then
  echo -e "$red$xmark$color_reset Docker is not installed"
  echo ""
  echo -e "$blue$info$color_reset Install Docker to continue"
  exit 1
else
  echo -e "$green$checkmark$color_reset Docker is installed"
fi

# |5| Verify Docker engine is running
if ! docker stats --no-stream &> /dev/null; then
  echo -e "$red$xmark$color_reset Docker engine is not running"
  echo ""
  echo -e "$blue$info$color_reset Start Docker engine to continue"
  exit 1
else
  echo -e "$green$checkmark$color_reset Docker engine is running"
fi

# |6| Verify docker-compose script exists
if [ ! -f db/docker/docker-compose-dev-fw-pg.yml ]; then
  echo -e "$red$xmark$color_reset docker-compose file not found"
  echo ""
  echo -e "$blue$info$color_reset Configure db/docker/docker-compose-dev-fw-pg.yml to continue"
  exit 1
else
  echo -e "$green$checkmark$color_reset docker-compose file found"
fi

# |7| Docker-compose up pg & flyway containers with env vars
echo ""
echo "Starting postgres container and initializing with flyway migrate..."
docker-compose -f db/docker/docker-compose-dev-fw-pg.yml up -d

# |8| Success output
echo ""
echo -e "$green$success$color_reset"
echo -e "$cyan$chevron$color_reset Control database migrations with$cyan pnpm db:dev:flyway$color_reset commands, e.g.$cyan pnpm db:dev:flyway migrate$color_reset"
echo -e "$cyan$chevron$color_reset Modify database content and data models in$cyan db/migrations/$color_reset and$cyan models/$color_reset"
echo -e "$cyan$chevron$color_reset Connect to postgres when needed with$cyan pnpm db:dev:connect:psql$color_reset"
echo -e "$cyan$chevron$color_reset Run unit tests on the demo database with$cyan pnpm jest:db$color_reset"
echo -e "$cyan$chevron$color_reset Run unit tests on the demo data models with$cyan pnpm jest:models$color_reset"
echo ""
