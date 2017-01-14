#!/usr/bin/env bash
ansible -i devops/hosts webservers -m ping