#!/bin/zsh
#
# fix-server-relative-paths.sh

# errexit
set -e

# send stdout and stderr to logs file
mkdir -p ./.log
LOG_PATH="./.log/fix-server-relative-paths.log"
echo "[$(date)]" >> $LOG_PATH
exec > >(tee -a $LOG_PATH) 2>&1

# variables
SERVER_PATH="server/.tsc/server/index.js"

# |0| Confirm file exists at path
if [ ! -f "$SERVER_PATH" ]; then
  echo "File $SERVER_PATH not found"
  exit 1
fi

# |1| Fix lockpage path
perl -i -pe 's#"\.\.\/"#"../../../"#g' $SERVER_PATH

# |2| Fix certificates path
# perl -i -pe "s#'\.\.\/\.certificates#'../../../.certificates#g" $SERVER_PATH

# done
echo "done" >> $LOG_PATH
