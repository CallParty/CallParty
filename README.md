# webhooks, testing

for local development,
install local tunnel with:
`npm install -g localtunnel`
and then run
````
lt --subdomain callingtest2 --port 8081, and message https://www.facebook.com/CallingTest2-1284903778233560/
lt --subdomain callingtest3 --port 8081, and message https://www.facebook.com/pg/CallingTest3-394972167517670/
lt --subdomain callingtest4 --port 8081, and message https://www.facebook.com/pg/CallingTest4-1292845147475522/
````

for staging, message:
https://www.facebook.com/Callingteststaging-392499054435475/

for production, message:
https://www.facebook.com/CallParty-243195752776526/

# todo

admin.callparty.org goes to 104.198.233.193 (then redo letsencrypt)
callparty.org goes to https://github.com/kelseyah/call-party

testout botkits data store (once we have a mongo db in the cloud somewhere)

google todo:
- way to upgrade gcloud account & get 2 static IP addresses?
- create load balancer / static DNS
ssh keys: https://console.cloud.google.com/compute/metadata/sshKeys?project=neat-bongo-155416

how to create credentials file: https://console.developers.google.com/apis/credentials?project=neat-bongo-155416
https://developers.google.com/identity/protocols/application-default-credentials


# notes

example app this was based off of: 
https://github.com/mvaragnat/botkit-messenger-express-demo


... to install letsencrypt certificate

1. set nginx.site.conf to have correct server domain
2. ssh onto server
3. install certbot-auto on server (https://certbot.eff.org/#ubuntutrusty-nginx)
4. `certbot-auto --nginx` # follow instructions
5. 
`````
this will produce the certs needed in: /etc/letsencrypt/live/memoryprosthetics.com/fullchain.pem
sudo chown ubuntu -R /etc/letsencrypt
scp -r -i secret_files/google_rsa ubuntu@104.198.233.193:/etc/letsencrypt/live/callparty.org/ secret_files/certs 
privkey.pem == nginx:ssl_certificate_key
fullchain.pem == nginx:ssl_certificate
cp secret_files/certs/privkey.pem secret_files/nginx.key
cp secret_files/certs/fullchain.pem secret_files/nginx.crt
`````






