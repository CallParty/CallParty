#!/usr/bin/env bash
set -e
BASEDIR=$( cd $(dirname $(dirname $0)) ; pwd -P )
$BASEDIR/bash/test.sh
cd $BASEDIR/../frontend; BUILD_ENV=staging npm run build
cd $BASEDIR/devops
GCE_INI_PATH=$BASEDIR/devops/gce.ini ansible-playbook -i inventory staging_deploy.yml

