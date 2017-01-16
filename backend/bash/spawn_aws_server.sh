#!/usr/bin/env bash
set -e
BASEDIR=$( cd $(dirname $(dirname $0)) ; pwd -P )
cd $BASEDIR
while read line; do export "$line";
done <$BASEDIR/.env
cd $BASEDIR/devops
ansible-playbook spawn_aws_server.yml
cd $BASEDIR
ansible-playbook -i devops/hosts devops/setup_server.yml
ansible-playbook -i devops/hosts devops/deploy.yml
