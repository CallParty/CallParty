#!/usr/bin/env bash
# this script adds this apps self-signed certificate to the list of trusted certificates for this computer
sudo security add-trusted-cert -d -r trustRoot -k "/Library/Keychains/System.keychain" "secret_files/nginx.crt"
