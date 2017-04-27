#!/usr/bin/env bash
set -e
BASEDIR=$( cd $(dirname $(dirname $0)) ; pwd -P )
cd $BASEDIR/devops
tar cvf secret_files.tar secret_files/*
travis encrypt-file secret_files.tar
rm secret_files.tar
