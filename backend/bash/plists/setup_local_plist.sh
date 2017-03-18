#!/usr/bin/env bash
BASEDIR=$( cd  $(dirname $0)/../../.. ; pwd -P )
cd $BASEDIR
echo "+ BASEDIR: ${BASEDIR}"

# create callparty local dev plist
PLIST_TEMPLATE=$BASEDIR/backend/bash/plists/callparty_local/com.user.callparty_local.plist
PLIST_DESTINATION=${HOME}/Library/LaunchAgents/com.user.callparty_local.plist
echo "++ copying ${PLIST_TEMPLATE} to destination ${PLIST_DESTINATION}"
sed "s|BASEDIR|${BASEDIR}|" $PLIST_TEMPLATE > $PLIST_DESTINATION

launchctl load $PLIST_DESTINATION
launchctl start com.user.callparty_local



