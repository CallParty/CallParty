#!/usr/bin/env bash
PDIR=${HOME}/.callparty/mongo-admin/
echo "++ plist is running" > $PDIR/test_plist.txt
node $PDIR/app.js >> $PDIR/plist.log 2>&1