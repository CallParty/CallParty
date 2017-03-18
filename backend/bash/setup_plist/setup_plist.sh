#!/usr/bin/env bash
BASEDIR=$( cd  $(dirname $0) ; pwd -P )
cd $BASEDIR
echo '+ BASEDIR: ${BASEDIR}'

PDIR=${HOME}/.callparty/mongo-admin/
cp $BASEDIR/mongo_admin_startup.sh $PDIR/mongo_admin_startup.sh
cp $BASEDIR/com.user.loginscript.plist ~/Library/LaunchAgents/com.user.loginscript.plist

launchctl load ~/Library/LaunchAgents/com.user.loginscript.plist
launchctl start com.user.loginscript