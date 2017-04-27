#!/usr/bin/env bash

set -e
BASEDIR=$( cd $(dirname $(dirname $0)) ; pwd -P )
cd $BASEDIR/../
tar cvf backend/devops/secret_files.tar backend/devops/secret_files/*
travis encrypt-file backend/devops/secret_files.tar --add before_deploy
rm backend/devops/secret_files.tar
