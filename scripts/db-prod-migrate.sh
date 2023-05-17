#!/bin/zsh
#
# db-prod-migrate.sh

# send stdout and stderr to logs file; enable errexit
set -ex # enable errexit, xtrace
mkdir -p ~/log
exec > >(tee -a ~/log/db-prod-migrate.log) 2>&1
echo "[$(date)]"

# source ec2env and cd to project root
[[ -s ~/.ec2env ]] && source ~/.ec2env
cd /home/ubuntu/server/my-app &> /dev/null

# confirm database is running
set +e # disable errexit
pnpm db:prod:confirm
if [[ $? -ne 0 ]]; then
  echo "Database is not running. Aborting flyway migrate."
  echo ""
  exit 0
fi
set -e

# run flyway migrate via docker-compose
pnpm db:prod:flyway:migrate
