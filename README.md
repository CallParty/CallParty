# CallParty

You can sign up for CallParty here [https://www.facebook.com/CallPartyOrg/](https://www.facebook.com/CallPartyOrg/).

To learn more about contributing to CallParty check out the [contributing guide](https://github.com/mhfowler/CallParty/blob/contributing.md/CONTRIBUTING.md). 

# Setup

### Install Dependencies 
```bash
git clone git@github.com:mhfowler/CallParty.git
cd backend; npm install; npm install -g localtunnel; cd ..
cd frontend; npm install; cd ..
```
### Configure `backend/.env`
 
[Message](mailto:hi@callparty.org) one of the project maintainers for
a `backend/.env` file to connect to the staging database.
 
You will also need a facebook bot to test with. 
You can follow instructions for making a testbot here. Once you have a testbot you 
also need to set yourself as an admin for the bot for it to send you messages 
(note that there is a several minute delay for Facebook to propagate the changes once you set the admin)

Alternatively, if you are forking your own version
of CallParty then you will need to create your own database and use `backend/.env-demo` as an example
to create a `backend/.env`.
 

# Run

You can run and test the backend (botkit server) and the frontend (admin portal) independently.

## Backend (Botkit Server)

```bash
cd backend; ./bash/local_tunnel.sh <bot_number> &; ./bash/run.sh
```

Visit the webpage of your bot:
- https://www.facebook.com/CallingTest2-1284903778233560/ # josh
- https://www.facebook.com/pg/CallingTest3-394972167517670/ # max
- https://www.facebook.com/pg/CallingTest4-1292845147475522/ # oren
- https://www.facebook.com/CallingTest5-2060548600838593/

And send the message 'hello' to make sure everything is working.

for staging, message:
https://www.facebook.com/Callingteststaging-392499054435475/

for production, message:
https://www.facebook.com/CallParty-243195752776526/

## Frontend (Admin Portal)

```bash
cd frontend; npm start
```

And navigate to [http://localhost:8082](http://localhost:8082) to verify the page is working.


# Deployment

## staging
```bash
./backend/staging_deploy.sh
```

## production
```bash
./backend/prod_deploy.sh
```


# Notes

example app backend was based off of: 
https://github.com/mvaragnat/botkit-messenger-express-demo
