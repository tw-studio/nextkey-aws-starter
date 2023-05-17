#!/bin/bash
#
# generate-s3-bucket-name.sh

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

# |2| Get prefix

PREFIX="";
if [[ -z "$1" ]]; then
  echo -ne "$cyan?$color_reset Enter a prefix for your s3 bucket:  "
  read prefix

  if [[ ! -z "$prefix" ]]; then
    PREFIX="$prefix";
  fi
else
  PREFIX="$1";
fi

# |3| Verify prefix follows s3 bucket naming rules:
#     https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html
#
# Most relevant rules to check:
# 1) Bucket names must be between 3 (min) and 63 (max) characters long.
# 2) Bucket names can consist only of lowercase letters, numbers, dots (.), and hyphens (-).
# 3) Bucket names must begin and end with a letter or number.
# 4) Bucket names must not start with the prefix xn--

if [[ ! -z "$PREFIX" ]]; then

  if [[ "${#PREFIX}" -eq 63 ]]; then
    echo -ne "$red$error$color_reset Prefix is already at max length of 63 characters"
    exit 1
  fi

  if [[ "${#PREFIX}" -gt 63 ]]; then
    echo -ne "$red$error$color_reset Prefix can't be longer than 63 characters"
    exit 1
  fi

  regex1="^[a-z0-9.-]+$"
  if [[ ! "$PREFIX" =~ $regex1 ]]; then
    echo -ne "$red$error$color_reset Prefix must consist only of lowercase letters, numbers, dots (.), and hyphens (-)"
    exit 1
  fi

  regex2="^[a-z0-9]"
  if [[ ! "$PREFIX" =~ $regex2 ]]; then
    echo -ne "$red$error$color_reset Prefix must begin with a letter or number"
    exit 1
  fi

  regex3="^xn--"
  if [[ "$PREFIX" =~ $regex3 ]]; then
    echo -ne "$red$error$color_reset Prefix must not start with the prefix xn--"
    exit 1
  fi
fi

# |4| Generate random characters to combine with prefix for bucket name length 63

# Add hyphen to prefix if not there already
if [[ "${#PREFIX}" -le 61 && "${PREFIX: -1}" != "-" ]]; then
  PREFIX="${PREFIX}-"
fi

echo "Generating s3 bucket name..."
SUFFICIENTLY_RANDOM_LENGTH=25
let SUFFIX_LENGTH_MAX=63-${#PREFIX}
SUFFIX_LENGTH=$([[ $SUFFIX_LENGTH_MAX -gt $SUFFICIENTLY_RANDOM_LENGTH ]] && echo "$SUFFICIENTLY_RANDOM_LENGTH" || echo "$SUFFIX_LENGTH_MAX")

SUFFIX=$(cat /dev/urandom | LC_ALL=C tr -dc 'a-z0-9-' | fold -w $SUFFIX_LENGTH | head -n 1)

echo "${PREFIX}${SUFFIX}"
