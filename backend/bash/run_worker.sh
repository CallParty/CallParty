#!/usr/bin/env bash
BASEDIR=$( cd $(dirname $(dirname $0)) ; pwd -P )
cd $BASEDIR
node worker.js
