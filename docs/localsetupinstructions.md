# Running the bot locally

## In Facebook

1. Make a new FB page called CallingTest#X (where "X" is a number that does not already exist). 

2. Go to [developers.facebook.com](https://developers.facebook.com) and add a new app named CallingTest#X (where "X" is a number )

Then...

## Setup a Local Environment

### Open 4 Terminal Windows
First: `cd backend`
Second: `cd backend`
Third: 	For your MongoDB instance
Fourth: `cd frontend`

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

*Callback URL:*
use local tunnel url but add /api/webhook
Example: `https://callingtestX.localtunnel.me/api/webhook`

*Verify token:*
callingcongress100

*Subscription fields:*
messages
messaging_postback
messaging_optins


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