[![Build Status](https://travis-ci.org/CallParty/CallParty.svg?branch=master)](https://travis-ci.org/CallParty/CallParty)

<img width="350" height="200" src="http://callparty.org/assets/images/cp_wordmark.png" alt="CallParty Logo" />

# CallParty

CallParty is a FB Messenger bot to send calls to action for political issues, link to the specific reps to call, and updates on the issues that have been sent. To do this we’ve built an admin tool to input the calls to action, and segment messages to users based on the party or committee of their rep, and by the district the user lives in.

You can sign up for CallParty here [https://www.facebook.com/CallPartyOrg/](https://www.facebook.com/CallPartyOrg/).

[Learn more about CallParty by visiting our site!](http://callparty.org/)

–––
## Contributing to CallParty and Open Source

To learn more about *contributing to CallParty* check out the [contributing guide](./CONTRIBUTING.md).

### Running Your Local Instance of CallParty

[Make sure to check out the local setup instructions for how to set up Call Party the first time](./docs/LOCAL_SETUP_INSTRUCTIONS.md). Below is a quickstart for *users who already have Call Party set up* on their machine.

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

[Call Party Admin Docs](./docs/CP_ADMIN_NOTES.md)
