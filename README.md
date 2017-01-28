# webhooks, testing

# Setup

```bash
git clone git@github.com:mhfowler/CallParty.git
cd backend; npm install; npm install -g localtunnel; cd ..
cd frontend; npm install; cd ..
```

Message one of the project maintainers for a `.env` file to run the server and
make sure your facebook bot has you set as an admin. Once you are set, there is
a several minute delay for Facebook to propagate the changes.

# Run

## Backend

```bash
cd backend; ./bash/local_tunnel.sh <bot_number> &; ./bash/run.sh
```

Visit the webpage of your bot:

```bash
https://www.facebook.com/CallingTest2-1284903778233560/ # josh
https://www.facebook.com/pg/CallingTest3-394972167517670/
https://www.facebook.com/pg/CallingTest4-1292845147475522/
https://www.facebook.com/CallingTest5-2060548600838593/
```

And send the message `hello` to make sure everything is working.

for staging, message:
https://www.facebook.com/Callingteststaging-392499054435475/

for production, message:
https://www.facebook.com/CallParty-243195752776526/

## Frontend

After installing the frontend dependencies, to start the server run:

```bash
npm start
```

And navigate to `locahost:8082` to verify the page is working.

# todo

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
```
this will produce the certs needed in: /etc/letsencrypt/live/memoryprosthetics.com/fullchain.pem
sudo chown ubuntu -R /etc/letsencrypt
scp -r -i secret_files/google_rsa ubuntu@104.198.233.193:/etc/letsencrypt/live/callparty.org/ secret_files/certs 
privkey.pem == nginx:ssl_certificate_key
fullchain.pem == nginx:ssl_certificate
cp secret_files/certs/privkey.pem secret_files/nginx.key
cp secret_files/certs/fullchain.pem secret_files/nginx.crt
```

git command to use rebase and avoid merge commits: `git config branch.master.rebase true`

