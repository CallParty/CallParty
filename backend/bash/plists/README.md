

./setup_local_plist.sh creates a plist for running a local callparty development environment 
it expects there to be a run.sh in the root of callparty repo which runs your environment


./setup_mongo_admin_plist.sh creates a plist for running mongo-admin 
this script requires an argument of path pointing to where mongo-admin is cloned
... there must also be mongo_admin_startup.sh file in this folder. See mongo_admin_startup.sh
for an example (modify this file to run on your computer)