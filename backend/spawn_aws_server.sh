#!/usr/bin/env bash
set -e
SCRIPTPATH=$( cd $(dirname $0) ; pwd -P )
while read line; do export "$line";
done <$SCRIPTPATH/.env
cd $SCRIPTPATH/devops
ansible-playbook spawn_aws_server.yml
cd $SCRIPTPATH
ansible-playbook -i devops/hosts devops/setup_server.yml
ansible-playbook -i devops/hosts devops/deploy.yml
