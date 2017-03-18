<img src="http://callparty.org/assets/images/cp_wordmark.png" alt="Call Party Logo" />

# CallParty

CallParty is a FB Messenger bot to send calls to action for political issues, link to the specific reps to call, and updates on the issues that have been sent. To do this we’ve built an admin tool to input the calls to action, and segment messages to users based on the party or committee of their rep, and by the district the user lives in.

You can sign up for CallParty here [https://www.facebook.com/CallPartyOrg/](https://www.facebook.com/CallPartyOrg/).

[Learn more about Call Party by visiting our site!](http://callparty.org/)

–––
## Contributing to Call Party and Open Source

To learn more about *contributing to CallParty* check out the [contributing guide](https://github.com/mhfowler/CallParty/blob/contributing.md/CONTRIBUTING.md).

### Setting Up Call Party Locally

#### 1. Install System Dependencies

##### OS X
Install MongoDB, Redis, and NVM

```bash
brew install mongodb redis

curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.0/install.sh | bash # install nvm

export NVM_DIR="$HOME/.nvm"

[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" # This loads nvm

nvm install 7.4.0
```

##### Linux & Windows
(Coming soon... Feel free to contribute!!!)


#### 2. Install App Dependencies

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

#### Configure backend and .env

[Message](mailto:hi@callparty.org) one of the project maintainers for
a `backend/.env` file to connect to the staging database. 

##### [Local Setup Instructions](./docs/localsetupinstructions.md)

You will also need a facebook bot to test with. [You can follow instructions for making a testbot here](./docs/localsetupinstructions.md). Once you have a testbot you also need to set yourself as an admin for the bot for it to send you messages (note that there is a several minute delay for Facebook to propagate the changes once you set the admin)

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

### Running Your Local Instance of Call Party

[Make sure to check out the local setup instructions for how to set up Call Party the first time](./docs/localsetupinstructions.md). Below is a quickstart for users who already have Call Party set up on their machine.

1. Open up 4 Terminal (or your preferred CLI) windows

2. Start up MongoDB
In your first window, start up your local MongoDB
```bash
mongod
```

3. Start up Localtunnel

Your bot number will be the number from your Call Party test page used in the setup.
```bash
cd backend

./bash/local_tunnel.sh <bot_number>
```

4. Start up backend server
```bash
cd backend

npm start
```
5. Start up frontend server
```bash
cd frontend

npm start
```

6. Navigate to [http://localhost:8082/](http://localhost:8082/) to view the Call Party front end and to send messages to your test user


7. Visit the webpage of your bot:
https://www.facebook.com/CallingTestX-XXXXXXXXXXX/ (you will have this info from your setup)

### Running Tests

To run the tests:
```bash
cd backend 

npm test
```

## Notes

Example app backend was based off of: [https://github.com/mvaragnat/botkit-messenger-express-demo](https://github.com/mvaragnat/botkit-messenger-express-demo)

[Call Party Admin Docs](./docs/cp-admin-notes.md)

