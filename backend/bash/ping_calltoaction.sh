#!/usr/bin/env bash
curl -X POST -H 'content-type:application/json' -d '{"fbId": "1260551614030071", "campaignId": "587d3ed9e1270926b052490b", "campaignActionId": "587d3ff2e1270926b052490c", "repId": "587be995318eb537fa4d9cb0"}' http://localhost:8081/api/start/calltoaction/
