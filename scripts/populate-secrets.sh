#!/bin/zsh
#
# populate-secrets.sh

# exit on first fail and echo commands
set -ex

# send stdout and stderr to logs file
mkdir -p ~/log
exec > >(tee -a ~/log/codedeploy-populate-secrets.log) 2>&1
echo "[$(date)]"

# source ec2env and cd to project root
[[ -s /home/ubuntu/.ec2env ]] && source /home/ubuntu/.ec2env

# configure pm2 with log-rotate
pm2 install pm2-logrotate

# populate production secrets from SSM Parameter Store
cd /home/ubuntu/server/my-app &> /dev/null
pnpm install
pnpm store prune
pnpm secrets:prod
