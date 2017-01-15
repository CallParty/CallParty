#!/usr/bin/env bash
# to install local tunnel run `npm install -g localtunnel`
# usage: /local_tunnel.sh <number_of_callingtestbot>
while true
do
    echo "++ restarting tunnel"
    lt --subdomain callingtest$1 --port 8081
done

