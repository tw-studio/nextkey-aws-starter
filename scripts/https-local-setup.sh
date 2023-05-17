#!/bin/bash
#
# https-local-setup.sh
# run with pnpm https:local:setup (or just pnpm dev)

set -e # errexit

echo "Starting https-local-setup..."

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

# |1| Verify USE_HTTPS_LOCAL environment variable is set
if [[ -z "$USE_HTTPS_LOCAL" ]]; then
  echo -e "$red$xmark$color_reset USE_HTTPS_LOCAL environment variable is set"
  echo -e "$blue$chevron$color_reset To run https for local development, set USE_HTTPS_LOCAL to '1' in .secrets.js"
  exit 0
else
  echo -e "$green$checkmark$color_reset USE_HTTPS_LOCAL environment variable is set"
fi

# |2| Check USE_HTTPS_LOCAL value
if [[ "$USE_HTTPS_LOCAL" != '1' ]]; then
  echo -e "$red$xmark$color_reset USE_HTTPS_LOCAL is set to '1'"
  echo -e "$blue$chevron$color_reset To run https for local development, set USE_HTTPS_LOCAL to '1' in .secrets.js"
  exit 0
else
  echo -e "$green$checkmark$color_reset USE_HTTPS_LOCAL is set to '1'"
fi

# |3| Check localhost.key and localhost.crt are in server/
if [[ -f server/.localcerts/localhost.key && -f server/.localcerts/localhost.crt ]]; then
  echo -e "$green$checkmark$color_reset localhost.key and localhost.crt found in server/.localcerts/"
  echo -e "$green$done$color_reset Setup for local https complete"
  exit 0
else
  echo -e "$red$xmark$color_reset localhost.key and localhost.crt found in server/"
fi

# |4| Check mkcert is installed
if ! command -v mkcert > /dev/null; then
  echo -e "$red$xmark$color_reset mkcert installation found"
  echo -e "$blue$chevron$color_reset Install$cyan mkcert$color_reset via the steps at$white https://github.com/FiloSottile/mkcert"
  exit 1
else
  echo -e "$green$checkmark$color_reset mkcert installation found"
fi

# |5| Check for local root CA files
if [[ -f "$(mkcert -CAROOT)/rootCA.pem" && -f "$(mkcert -CAROOT)/rootCA-key.pem" ]]; then
  echo -e "$green$checkmark$color_reset Root CA files found locally"
  echo ""
  echo "Generating new certificate and key valid for localhost..."
  mkcert -cert-file server/.localcerts/localhost.crt -key-file server/.localcerts/localhost.key localhost 127.0.0.1
  echo -e "$green$success$color_reset Setup for local https complete"
  exit 0
else
  echo -e "$red$xmark$color_reset Root CA files found locally"
  echo ""
  echo "Generating and installing a new local CA..."
  mkcert -install
  echo ""
  echo "Generating new certificate and key valid for localhost..."
  mkcert -cert-file server/.localcerts/localhost.crt -key-file server/.localcerts/localhost.key localhost 127.0.0.1
  echo -e "$green$success$color_reset Setup for local https complete"
  exit 0
fi
