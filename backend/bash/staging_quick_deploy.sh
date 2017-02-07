#!/usr/bin/env bash
BASEDIR=$( cd $(dirname $(dirname $0)) ; pwd -P )
cd $BASEDIR/devops
GCE_INI_PATH=$BASEDIR/devops/gce.ini ansible-playbook -i inventory staging_deploy.yml --tags quick