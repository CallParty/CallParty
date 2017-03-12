#!/usr/bin/env bash
set -e
BASEDIR=$( cd $(dirname $(dirname $0)) ; pwd -P )
cd $BASEDIR/../
source $BASEDIR/../.env

MIGRATION_NAME=$1
if [ -z "$MIGRATION_NAME" ]; then
  ./node_modules/.bin/migrate -d $MONGODB_URI --es6 --autosync up --es6 --autosync || :
else
  ./node_modules/.bin/migrate -d $MONGODB_URI up $MIGRATION_NAME --es6 --autosync || :
fi
