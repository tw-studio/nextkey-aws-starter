#!/bin/bash
#
# confirm-dev-server-running.sh

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

# |1| Verify server is running
set +e # disable errexit
pm2 describe server &> /dev/null
EXIT_CODE_PM2_PID_SERVER=$? 
if [[ $EXIT_CODE_PM2_PID_SERVER -ne 0 ]]; then
  echo -e "$red$xmark$color_reset$cyan server$color_reset is not running in pm2"
  echo -e "$cyan$chevron$color_reset Serve the app for development and testing with$cyan pnpm serve:dev$color_reset"
  echo ""
  exit 1
fi
set -e
