var User = require('../models/User')
var Meetup = require('../models/Meetup')
var hash = require('../utils/hash')
var jwt = require('jsonwebtoken')
var JSONStream = require('jsonstream')
const {check, validationResult} = require('express-validator')

module.exports = function(app){
    app.post('/meetup/create',[
        check('username')
            .not()
            .isEmpty(),
        check('title')
            .not()
            .isEmpty(),
        check('city')
            .not()
            .isEmpty(),
        check('state')
            .not()
            .isEmpty(),
        check('date')
            .not()
            .isEmpty() 
        ], async(req, res)=>{
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            else {
                var username = req.body.username
                var title = req.body.title
                var description = req.body.description
                var invited = req.body.invited
                var street = req.body.street
                var city = req.body.city
                var state = req.body.state
                var date = req.body.date
                var startTime = req.body.startTime
                var duration = req.body.duration
                try{
                    var meetupId = await hash.hashMeetupId(username+title+startTime)
                    
                    var meetup = new Meetup({
                        owner : username,
                        meetupId : meetupId,
                        title : title,
                        description : description,
                        invited :  invited,
                        street : street,
                        city : city,
                        state : state,
                        date : date,
                        startTime : startTime,
                        duration : duration
                    })

                    var result = await Meetup.createMeetup(meetup)
                    
                    if(result){
                        res.status(200).json({'message' : 'Meetup created'})
                    }
                    
                    else{
                        res.status(500).json({'message' : 'Internal server error'})
                    }
                } catch(err) { 
                    console.log(err)
                    res.status(500).json({'message' : 'Internal server error'})
                }
        }
    })


    app.get('/meetup/list', [
        check('username')
            .not()
            .isEmpty(),
        check('password')
            .not()
            .isEmpty() 
        ], async(req, res)=>{
            var username = req.params.username
            try{
                Meetup.find({ username : username}).cursor()
                    .pipe(JSONStream.stringify())
                    .pipe(res.type('json'))            
            } catch(err) {
                console.log(err)
                res.status(500).json({'message' : 'Server error'})
            }
    })
}