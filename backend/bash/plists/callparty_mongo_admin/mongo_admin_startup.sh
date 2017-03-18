#!/usr/bin/env bash
## you should put a file like this into your mongo-admin folder
echo "++ starting callparty mongo-admin" > ${HOME}/log/callparty_mongo_admin.txt
BASEDIR=$( cd $(dirname $0) ; pwd -P )
shopt -s expand_aliases
source ${HOME}/.bash_profile
usenvm
node $BASEDIR/app.js > ${HOME}/log/callparty_mongo_admin.log 2>&1