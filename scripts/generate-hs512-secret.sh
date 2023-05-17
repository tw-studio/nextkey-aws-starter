#!/bin/bash
#
# generate-hs512-secret.sh

LENGTH=64
SECRET=$(cat /dev/urandom | LC_ALL=C tr -dc 'a-zA-Z0-9-_.' | fold -w $LENGTH | head -n 1)

echo "${SECRET}"

