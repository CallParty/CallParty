#!/usr/bin/env bash
BASEDIR=$( cd $(dirname $(dirname $0)) ; pwd -P )
cd $BASEDIR/../frontend; BUILD_ENV=production npm run build
cd $BASEDIR/devops
GCE_INI_PATH=$BASEDIR/devops/gce.ini ansible-playbook -i inventory prod_deploy.yml