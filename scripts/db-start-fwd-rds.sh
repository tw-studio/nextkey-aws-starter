#!/bin/bash
#
# db-start-fwd-rds.sh
# › Run this script with 'pnpm db:prod:fwd:rds'
# › Starts SSM Session Manager port forwarding session to RDS instance
# › Enables subsequently running 'pnpm db:prod:fwd:psql' in separate terminal to connect to RDS instance

# |1| Prepare formatting variables

# colors
blue="\033[0;34m"
color_reset="\033[0m"
cyan="\033[0;36m"
green="\033[0;32m"
red="\033[0;31m"
white="\033[0;37m"
# content
arrow="\xE2\x86\x92"
chevron="\xE2\x80\xBA"
error="error"
info="info"
success="Success!"

# |2| Get instance id

INSTANCE_ID="";
if [[ -z "$1" ]]; then
  echo -ne "$cyan?$color_reset What is the instance id for the forwarding ec2 instance?  "
  read instanceId

  if [[ ! -z "$instanceId" ]]; then
    INSTANCE_ID="$instanceId";
  fi
else
  INSTANCE_ID="$1";
fi

# |3| Start SSM Session Manager port forwarding session

if [[ -z "$INSTANCE_ID" ]]; then
  echo -ne "$red$error$color_reset No instance id entered"
  exit 1
fi

echo "Starting SSM Session Manager port forwarding session..."

aws ssm start-session --target "$INSTANCE_ID" --document-name AWS-StartPortForwardingSession --parameters '{"portNumber":["'"$DB_PROD_PORT"'"], "localPortNumber":["'"$DB_PROD_PORT"'"]}'
