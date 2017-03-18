#!/usr/bin/env bash
# ./setup_mongo_admin.sh <destination folder>
set -e
BASEDIR=$( cd $(dirname $0)/../.. ; pwd -P )
cd $BASEDIR
echo "+ BASEDIR: ${BASEDIR}"

# if argument supplied then clone to that location, otherwise use default location ~/.callparty/mongo-admin
if [ -z "$1" ]
  then
    CALLPARTYDIR=${HOME}/.callparty
    mkdir $CALLPARTYDIR
    WHERE=$CALLPARTYDIR/mongo-admin
   else
    WHERE=$1
fi

git clone https://github.com/mrvautin/adminMongo.git $1
cd $1
npm install
rm $1/config/app.json
rm $1/config/config.json
ln -s $BASEDIR/backend/devops/secret_files/mongo_admin/app.json $1/config/app.json
ln -s $BASEDIR/backend/devops/secret_files/mongo_admin/config.json $1/config/config.json

echo "command to run mongo-admin: node ${1}/app.js"