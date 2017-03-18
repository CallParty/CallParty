#!/usr/bin/env bash
# ./setup_mongo_admin.sh ~/Desktop/mongo-admin
set -e
BASEDIR=$( cd $(dirname $0)/../.. ; pwd -P )
cd $BASEDIR
echo "+ BASEDIR: ${BASEDIR}"

WHERE=$1
git clone https://github.com/mrvautin/adminMongo.git $1
cd $1
npm install
rm $1/config/app.json
rm $1/config/config.json
ln -s $BASEDIR/backend/devops/secret_files/mongo_admin/app.json $1/config/app.json
ln -s $BASEDIR/backend/devops/secret_files/mongo_admin/config.json $1/config/config.json

echo "command to run mongo: node ${1}/app.js"