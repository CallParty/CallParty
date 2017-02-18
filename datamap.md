# Call Party Collections & Data Mapping

## botkit_users
- _id
- id
- created_at

## Campaigns
### campaigns
Top level of campaigns which actions are nested under. 

- _id
- title
- description
- createdAt

### campaignactions
Campaign actions are references to a high level campaign. Campaign actions are where the actual messaging to the users is derived.

- _id
- title
- message
- active
- type
- campaign //object reference to campaign
- createdAt
- committees //array of committee IDs
- parties //array of parties (rep, dem, ind)
- memberTypes //array of member types (rep or sen)

### campaignupdates
Campaign updates are single messages sent to users who have received information about a campaign action. Campaign updates reference a campaign action.

- _id
- message
- campaignAction //object reference to campaign action
- campaign //object reference to campaign
- createdAt

## Representatives and Committee Data
### reps
- _id
- bioguide
- id
- full_name
- first_name
- last_name" : "Grothman
- official_full
- gender
- state
- party
- url
- phone
- govtrack
- legislator_type
- term_start
- term_end
- district
- wikipedia
- wikidata

### committees
- _id
- thomasId
- type
- name
- address
- phone
- jurisdiction
- jurisdictionSource
- houseCommitteeId
- senateCommitteeId
- url
- minorityUrl

### representativecommittees
Join tables of reps and committees
- _id
- committee
- representative

### representativesubcommittees
Join tables of reps and subcommittees
- _id
- representative
- subcommittee

### subcommittees
- _id
- committee
- thomasId
- name
- address
- phone

## User Data
### users
- _id
- fbId
- firstName
- lastName
- firstCTA
- unsubscribed
- active
- callbackPath
- congressionalDistrict
- state
- convoData
	- repWebsite
	- repPhoneNumber
	- repImage
	- repName
	- repType
	- issueAction
	- issueSubject
	- issueLink
	- issueMessage
	- firstName








