#!/usr/bin/env bash
BASEDIR=$( cd $(dirname $(dirname $0)) ; pwd -P )
cd $BASEDIR
ansible-playbook -i devops/hosts devops/setup_server.yml