#!/usr/bin/env bash
curl -H "Content-Type: application/json" -X POST -d '{"username":"test","password":"test", "bot":"test"}' http://localhost:8082/api/admins