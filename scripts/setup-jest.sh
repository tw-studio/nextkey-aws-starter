#!/bin/bash
#
# setup-jest.sh
# › run with pnpm jest:setup

set -e # errexit

# echo "Starting setup-jest..."
# echo ""

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

# |1| Copy mockServiceWorker.js into public/ when NEXT_PUBLIC_API_MOCKING is 'enabled'
if [[ "$NEXT_PUBLIC_API_MOCKING" == "enabled" ]]; then
  echo ""
  echo -e "$green$checkmark$color_reset NEXT_PUBLIC_API_MOCKING is 'enabled'"
  echo -e "$cyan$chevron$color_reset Copying mockServiceWorker.js into public/..."
  echo ""
  \cp config/__mocks__/mockServiceWorker.js public/mockServiceWorker.js
# else
  # echo -e "$red$xmark$color_reset NEXT_PUBLIC_API_MOCKING is not 'enabled'"
fi
# echo ""

