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
        check('datetime')
            .not()
            .isEmpty() 
        ], async(req, res)=>{
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            else {
                console.log(typeof(req.body.invited))
                var username = req.body.username
                var title = req.body.title
                var description = req.body.description
                var invited = req.body.invited.split(',').map(s => s.trim());
                var street = req.body.street
                var city = req.body.city
                var state = req.body.state
                var datetime = req.body.datetime
                var duration = req.body.duration
                try{
                    var meetupId = await hash.hashMeetupId(username+title+datetime)
                    
                    var meetup = new Meetup({
                        owner : username,
                        meetupId : meetupId,
                        title : title,
                        description : description,
                        invited :  invited,
                        street : street,
                        city : city,
                        state : state,
                        datetime : datetime,
                        duration : duration,
                        createdAt : Date.now()
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


    app.get('/meetup/listByUsername', [
        check('username')
            .not()
            .isEmpty() 
        ], async(req, res)=>{
            var username = req.body.username
            try{
                Meetup.find({ owner : username, datetime : {$gte : Date.now()}}).cursor()
                    .pipe(JSONStream.stringify())
                    .pipe(res.type('json'))            
            } catch(err) {
                console.log(err)
                res.status(500).json({'message' : 'Server error'})
            }
    })


    app.get('/meetup/listByLocation', [
        check('city')
            .not()
            .isEmpty(),
        check('state')
            .not()
            .isEmpty() 
        ], async(req, res)=>{
            var city = req.body.city
            var state = req.body.state
            try{
                Meetup.find({ city : city, state : state, datetime : {$gte : Date.now()}}).cursor()
                    .pipe(JSONStream.stringify())
                    .pipe(res.type('json'))            
            } catch(err) {
                console.log(err)
                res.status(500).json({'message' : 'Server error'})
            }
    })

    app.get('/meetup/listByInvitation', [
        check('username')
            .not()
            .isEmpty()
        ], async(req, res)=>{
            var username = req.body.username
            try{
                Meetup.find({ invited : username, datetime : {$gte : Date.now()}}).cursor()
                    .pipe(JSONStream.stringify())
                    .pipe(res.type('json'))            
            } catch(err) {
                console.log(err)
                res.status(500).json({'message' : 'Server error'})
            }
    })

}