# Call Party - Application and Data Flow

## Representation of the Application and Data Models for the Call Party Application

### Data Collections:

[Data Map for Call Party](datamap.md)

- Campaigns - Top level campaign information
- Campaign Actions - Specific and targeted messaging/data for a bot conversation
- Representatives - Stores Representative data
- Users - Stores Users information
- User Actions - Stores active Users information about Campaign Actions and the User's progress
- User Actions Archive - Stores inactive User Actions for a period of time 

### Application Flow

From the Call Party admin, the admin creates a `Campaign` with a title and a description. They are then brought to the Campaign's page where they can add or modify a `Campaign Action.` 

When creating a `Campaign Action` the admin will select a group of legislators and insert the messaging. 

...

