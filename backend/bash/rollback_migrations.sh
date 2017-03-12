#!/usr/bin/env bash
set -e
BASEDIR=$( cd $(dirname $(dirname $0)) ; pwd -P )
cd $BASEDIR/../
source $BASEDIR/../.env

MIGRATION_NAME=$1
./node_modules/.bin/migrate -d $MONGODB_URI down $MIGRATION_NAME --es6 --autosync
