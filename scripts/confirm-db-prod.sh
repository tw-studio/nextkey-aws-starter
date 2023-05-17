#!/bin/zsh
#
# confirm-db-prod.sh
# › run with pnpm db:prod:confirm

set -e # enable errexit
mkdir -p ~/log
exec > >(tee -a ~/log/db-prod-migrate.log) 2>&1
echo "[$(date)]"

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

set -x # enable xtrace

# source ec2env and cd to project root
[[ -s ~/.ec2env ]] && source ~/.ec2env
cd /home/ubuntu/server/my-app &> /dev/null

# |1| Verify useDatabase is set to '1'
if [[ "$USE_DATABASE" != "1" ]]; then
  echo -e "$red$xmark$color_reset USE_DATABASE is not set to '1'"
  echo -e "$blue$chevron$color_reset Set$cyan useDatabase$color_reset to '1' in .production.secrets.js to use database"
  echo ""
  exit 1
else
  echo -e "$green$checkmark$color_reset USE_DATABASE is set to '1'"
fi

# |2| Verify DB_PROD_PORT and DB_PROD_HOST environment variables are set
if [[ -z "$DB_PROD_PORT" || -z "$DB_PROD_HOST" ]]; then
  echo -e "$red$xmark$color_reset DB_PROD environment variables are not all set"
  echo -e "$blue$chevron$color_reset Be sure to run this script with$cyan pnpm confirm:db:prod$color_reset"
  echo ""
  exit 1
fi

# |3| Confirm postgresql is running at expected DB_DEV_PORT
set +e # disable errexit
set +x # disable xtrace for security to avoid logging password
PGPASSWORD=$DB_PROD_PASSWORD pg_isready -U $DB_PROD_USER -h localhost -p $DB_PROD_PORT -d $DB_PROD_DATABASE_NAME && exit 0
set -ex
# pg_isready returned non-zero exit code
echo -e "$red$xmark$color_reset Database connection is not available"
echo -e "$cyan$chevron$color_reset Confirm$cyan dbProd$color_reset parameters are set correctly in SSM and in$cyan cdk/my-app-cdk/.env/.secrets.js$color_reset"
echo ""
exit 1
