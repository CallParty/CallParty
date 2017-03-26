# Call Party - Application Logic and Data Flow

## Representation of the Application and Data Models for the Call Party Application

### Data Collections:

[Data Map for Call Party](DATA_MAP.md)

- Campaigns - Top level campaign information
- Campaign Actions - Specific and targeted messaging/data for a bot conversation
- Representatives - Stores Representative data
- Users - Stores Users information
- User Actions - Stores active Users information about Campaign Actions and the User's progress
- User Actions Archive - Stores inactive User Actions for a period of time 

### Application Flow

#### Create Campaign

From the Call Party admin, the admin creates a `Campaign` with a title and a description. They are then brought to the Campaign's page where they can add or modify a `Campaign Action.` 

#### Create Campaign Action

When creating a `Campaign Action` the admin will select a group of legislators and insert the messaging. The admin will then submit the action triggers the application to send messages to the correct population of users.

#### Creare Campaign Action Update

If the admin wants to, they may add an `Update` to the `Campaign Action` that will trigger the application the send a message to the previously identified group of users. 

### Messenger Conversations

#### Signup

When the user initially prompts the Call Party bot, a conversation will start with the application to gather the user's address for purposes of a one time lookup of the user's congressional district. The only data Call Party stores in this case is the district ID and state for purposes of identifying the user's representatives.

After a complete and successful signup, the user will receive messages when `Campaign Actions` are submitted through the admin application.

#### Campaign Action Conversations

When the admin submits a new `Campaign Action`, the user will receive the message if they are part of the population as input by the admin. This will initiate a conversation that:

1. Prompts the user with information (description, script, calling info, etc.)
2. Prompts the user to respond when they have made the call with some parameters regarding the success or failure of the call
3. Prompts the user again if there are additional reps that need to be called
4. Sends messaging based on the user's response (of success or failure).

#### Campaign Updates

If the admin provides a `Campaign Action Update`, then the user will receive a message with the content of that update.



