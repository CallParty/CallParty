# Running the bot locally

## Setting Up Call Party Locally

### 1. Install System Dependencies

#### OS X
Install MongoDB and NVM

```bash
brew install mongodb

curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.0/install.sh | bash # install nvm

export NVM_DIR="$HOME/.nvm"

[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" # This loads nvm

nvm install 7.6.0 # or stable

gem install travis # used for managing secret_files
```

#### Linux & Windows
(Coming soon... Feel free to contribute!!!)


### 2. Install App Dependencies

1. Clone GitHub repository:
```bash
git clone https://github.com/CallParty/CallParty.git
```

2. Install Backend App Dependencies:
```bash
cd backend

npm install

npm install -g localtunnel

cd ../
```

3. Install Frontend App Dependencies:
```bash
cd frontend

npm install

cd ../
```

### 3. Configure backend and .env

[Message](mailto:hi@callparty.org) one of the project maintainers for
a `backend/.env` file to connect to the staging database.

You will also need a facebook bot to test with (as outlined below). Once you have a testbot you also need to set yourself as an admin for the bot for it to send you messages (note that there is a several minute delay for Facebook to propagate the changes once you set the admin)

Alternatively, if you are forking your own version of CallParty then you will need to create your own database and use `backend/.env-demo` as an example to create a `backend/.env`.

#### Environment Variables

Secure variables are stored in this file:
`/backend/.env`

You will have to create this file and input your own variables in here. You can see a boilerplate of this file located at `/backend/.env-demo`

##### JWT_SECRET

The `JWT_SECRET` environment variable is meant to be a secret cryptographic key used in generating and verifying JSON Web Tokens. `JWT_SECRET` should be set to a secret key produced according to [these instructions](https://github.com/dwyl/learn-json-web-tokens#how-to-generate-secret-key), using the following command:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'));"
```


## In Facebook

1. Make a new FB page called CallingTest#X (where "X" is a number that does not already exist).

2. Go to [developers.facebook.com](https://developers.facebook.com) and add a new app named CallingTest#X (where "X" is a number )

Then...

## Setup a Local Environment

After you have installed all the dependencies abover and have your .env file setup...

### Open 4 Terminal Windows
- First: `cd backend`
- Second: `cd backend`
- Third: 	For your MongoDB instance
- Fourth: `cd frontend`

#### Third Window (MongoDB)

Starts a local MongoDB instance
```bash
mongod
```
Make sure you set your .env variable for `MONGODB_URI` to `mongodb://localhost:27017`

#### 1st Backend Window:

```bash
npm install -g localtunnel

./bash/local_tunnel.sh <bot_number>
```

#### 2nd Backend Window:

```bash
npm run server
```

Then...

## Setting Up Webhooks
1. Open [developers.facebook.com](https://developers.facebook.com)
2. Make sure you’re admin
3. Setup Webhooks:

#### Callback URL:
- use local tunnel url but add /api/webhook
- Example: `https://callingtestX.localtunnel.me/api/webhook`

#### Verify token:
- callingcongress100

#### Subscription fields:
- messages
- messaging_postback
- messaging_optins


## Set up Page to accept Messages

1. On Facebook page, hover over main Button on right and choose “Edit Button”

2. Choose: Get in touch > Send Message

3. Create the secret file: Backend/devops/secret_files/facebook_app_credentials

4. Duplicate an existing file and replace with your #

5. Replace IDs with FACEBOOK_APP_ID (from the app), FACEBOOK_PAGE_ID (from the page), FACEBOOK_PAGE_TOKEN (by clicking generating token on the app page)

6. Copy .callingtest# credentials into your local .env

7. open .env in text editor

8. place content from .callingtest# into .env replacing existing

## Run admin locally:

1. Open front-end terminal and run:

```bash
npm start
```

## Test the Bot

1. On Facebook page, Select ‘…’ menu below fb cover photo

2. Select: View as Page Visitor

3. Send Message

——

## Notes:

If changes are made locally, you will have to restart the server. Return to 2nd backend window (not the localtunnel process):

1. `command + c` to stop the process

2. Restart the Server:
```bash
npm run server
```

3. Refresh pages
