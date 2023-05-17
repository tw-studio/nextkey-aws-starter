#!/bin/bash
#
# confirm-db-dev.sh
# › run with pnpm db:dev:confirm

set -e # errexit

# |0| Set formatting variables
# colors
blue="\033[0;34m"
color_reset="\033[0m"
cyan="\033[0;36m"
green="\033[0;32m"
red="\033[0;31m"
white="\033[0;37m"
yellow="\033[0;33m"
# content
arrow="\xE2\x86\x92"
checkmark="\xE2\x9C\x94"
chevron="\xE2\x80\xBA"
done="done"
info="info"
success="Success!"
xmark="\xE2\x9C\x97"

# |1| Verify useDatabase is set to '1'
if [[ "$USE_DATABASE" != "1" ]]; then
  echo -e "$red$xmark$color_reset USE_DATABASE is not set to '1'"
  echo -e "$blue$chevron$color_reset Set$cyan useDatabase$color_reset to '1' in .env/.secrets.js to use database"
  echo ""
  exit 1
fi

# |2| Verify DB_DEV_PORT environment variable is set
if [[ -z "$DB_DEV_PORT" ]]; then
  echo -e "$red$xmark$color_reset DB_DEV_PORT environment variable is not set"
  echo -e "$blue$chevron$color_reset Be sure to run this script with 'pnpm confirm:db:dev'"
  echo ""
  exit 1
fi

# |3| Confirm postgresql is running at expected DB_DEV_PORT
set +e # disable errexit
LSOF_DB_DEV_PORT=$(lsof -i :$DB_DEV_PORT); set -e
if [[ $LSOF_DB_DEV_PORT == *"*:postgresql (LISTEN)"* ]]; then
  exit 0
else
  echo -e "$red$xmark$color_reset postgresql not listening at :$DB_DEV_PORT"
  echo -e "$blue$chevron$color_reset Run$cyan pnpm db:dev:setup$color_reset to initialize the development database"
  echo ""
  exit 1
fi
