#!/usr/bin/env bash
BASEDIR=$( cd  $(dirname $0)/../../.. ; pwd -P )
cd $BASEDIR
echo "+ BASEDIR: ${BASEDIR}"

STARTUP_FILE=$1/mongo_admin_startup.sh
if [ -f "$STARTUP_FILE" ]
then
	echo "++ found startup file in ${STARTUP_FILE}"
else
	echo "++ ERROR: no startup file found in ${STARTUP_FILE}"
	echo "++ you must provide an argument to this script where mongo-admin is installed, see setup_mongo_admin.sh"
	echo "++ you must also make sure there is a mongo_admin_startup.sh file in mongo-admin which runs mongo-admin on your computer. See mongo_admin_startup.sh for an example"
	exit
fi


# create callparty local dev plist
PLIST_TEMPLATE=$BASEDIR/backend/bash/plists/callparty_mongo_admin/com.user.callparty_mongo_admin.plist
PLIST_DESTINATION=${HOME}/Library/LaunchAgents/com.user.callparty_mongo_admin.plist
echo "++ copying ${PLIST_TEMPLATE} to destination ${PLIST_DESTINATION}"
sed "s|MONGO_ADMIN_DIR|${1}|" $PLIST_TEMPLATE > $PLIST_DESTINATION

launchctl load $PLIST_DESTINATION
launchctl start com.user.callparty_mongo

echo "+ successfully added plist"



