# Meetup Internal API Docs

All endpoints are currently post unless mentioned as GET

All routes are protected by jwt which can be obtained from /client/login or /admin/login
Client jwt gives access to /client and /transaction endpoints
Admin jwt gives access to /admin endpoints


# Client

## - /client/signUp

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

## - /client/login

        Send :
            - username as req.body.username
            - password as req.body.password

        Receive : 
            Login success message and JWT 