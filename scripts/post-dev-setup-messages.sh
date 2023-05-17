#!/bin/bash
#
# post-dev-setup-messages.sh

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

# |1| Success output
echo ""
echo -e "$green$success$color_reset"
echo -e "$cyan$chevron$color_reset (optional) Run$cyan pnpm db:dev:setup$color_reset to initialize the demo database"
echo -e "$cyan$chevron$color_reset Run$cyan pnpm serve:dev$color_reset to build and serve the full NextKey demo experience"
echo -e "$cyan$chevron$color_reset Run$cyan pnpm dev$color_reset to hot reload the app's$cyan _main/$color_reset variation"
echo -e "$cyan$chevron$color_reset Run$cyan pnpm dev:guest$color_reset to hot reload the app's$cyan _guest/$color_reset variation"
echo -e "$cyan$chevron$color_reset Build and run all included unit tests with$cyan pnpm jest:all:build$color_reset"
