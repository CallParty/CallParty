#!/usr/bin/env bash
BASEDIR=$( cd $(dirname $(dirname $0)) ; pwd -P )
cd $BASEDIR
ansible-playbook -i devops/hosts devops/staging_deploy.yml