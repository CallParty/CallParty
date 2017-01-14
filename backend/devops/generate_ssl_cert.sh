#!/usr/bin/env bash
# make sure to enter public DNS of host in prompt: ec2-54-172-138-52.compute-1.amazonaws.com
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout secret_files/nginx.key -out secret_files/nginx.crt
