#!/usr/bin/env bash
set -e
BASEDIR=$( cd $(dirname $(dirname $0)) ; pwd -P )
cd $BASEDIR
source $BASEDIR/.env
./node_modules/.bin/migrate -d $MONGODB_URI list --es6 --autosync
