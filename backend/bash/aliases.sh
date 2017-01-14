#!/usr/bin/env bash
staging_cmd="ssh ubuntu@146.148.82.197 -i $BASEDIR/devops/secret_files/google_rsa"
prod_cmd="ssh ubuntu@104.198.233.193 -i $BASEDIR/devops/secret_files/google_rsa"
