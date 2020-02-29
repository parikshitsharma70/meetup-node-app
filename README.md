# Meetup Internal API Docs

All routes are protected by jwt which can be obtained from /client/login or /admin/login
Client jwt gives access to /client and /meetup endpoints
Admin jwt gives access to /admin endpoints


# User

## - /user/signUp
    POST
        Send : 
            - username as req.body.username
            - password as req.body.password
            - email as req.body.email
            - firstName as req.body.firstName
            - lastName as req.body.lastName
            - city as req.body.city
            - state as req.body.state

        Receive : 
            Confirmation for saved user      

## - /user/login
    POST
        Send :
            - username as req.body.username
            - password as req.body.password

        Receive : 
            Login success message and JWT 

# Meetup

## - /meetup/create
    POST
        Send : 
            - username as req.body.username
            - title as req.body.title
            - description as req.body.description
            - invited as req.body.invited (comma separated string)
            - street as req.body.street
            - city as req.body.city
            - state as req.body.state
            - datetime as req.body.datetime
            - duration as req.body.duration

        Receive : 
            Confirmation for meetup created

## - /meetup/listByUsername
    GET
        Send :
            - username as req.body.username

        Receive :
            List of meetups created by user

## - /meetup/listByLocation
    GET
        Send :
            - city as req.body.city
            - state as req.body.state
        
        Receive :
            List of meetups in city selected

## - /meetup/listByInvitation
    GET
        Send :
            - username as req.body.username

        Receive :
            List of meetups invited to

## - /meetup/inviteUsers
    POST
        Send :
            - username as req.body.username
            - meetupId as req.body.meetupId
            - invitees as req.body.invitees (comma separated string)

        Receive :
            Confirmation of users invited

## - /meetup/respondInvitation
    POST
        Send :
            - username as req.body.username
            - meetupId as req.body.meetupId
            - response as req.body.response (Yes/No/Maybe)

        Receive :
            Confirmation of response to invitation


