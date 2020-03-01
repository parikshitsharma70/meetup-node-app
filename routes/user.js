var User = require('../models/User')
var hash = require('../utils/hash')
var jwt = require('jsonwebtoken')
const {check, validationResult} = require('express-validator')

module.exports = function(app){
    app.post('/user/login', [
        check('username')
            .not()
            .isEmpty(),
        check('password')
            .not()
            .isEmpty()
        ], async(req, res)=>{
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            else{
                var username = req.body.username
                var password = req.body.password
                var find = {
                    'username' : username
                }
                try{
                    var found = await User.findUser(find)
                    if(!found){
                        res.status(401).json({ message : 'Username Invalid'})
                    }
                    else{
                        var compare = await hash.comparePassword(password, found.password)
                        if(compare){
                            await User.updateLastLogin({'username' : username})
                            const secret = "a89dsl2409fh232jks"
                            const token =  jwt.sign({username : username, password : password, role : found.role }, secret, { expiresIn: '12h' })
                            res.status(200).json({message: "Login successful", username : found.username, role : found.role, token : token});
                            }    
                        else {    
                            res.status(401).json({ message: 'Password Invalid' })
                        }
                    }
                } catch(err){
                    console.log(err)
                    res.status(500).json({message  : 'Server Error'})
                }
            }
    })

    app.post('/user/signUp', [
        check('email')
            .isEmail()
            .normalizeEmail(),
        check('password')
            .isLength({ min: 5 }).withMessage('Password must be min 5 characters')
            .matches(/\d/).withMessage('Password must contain a number'),
        check('passwordConfirmation')
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                throw new Error('Password confirmation does not match password');
                }
                return true
            }),
        check('username')
            .not()
            .isEmpty()
            .withMessage('Username cannot be empty'),
        check('username').custom(value => {
            return User.findUserByUsername(value).then(user => {
              if (user) {
                return Promise.reject('Username already in use');
              }
            })
          })
        ], async(req, res)=>{
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            else{
                var username = req.body.username
                var password = req.body.password
                var firstName = req.body.firstName
                var lastName = req.body.lastName
                var email = req.body.email
                var city = req.body.city
                var state = req.body.state
                var role = 'user'
                var lastLogin = 'Never'
                try{
                    var hashedPassword = await hash.hashPassword(password) 
                    var user = new User({
                        username : username,
                        password : hashedPassword,
                        email : email,
                        firstName : firstName,
                        lastName : lastName,
                        city : city,
                        state : state,
                        role : role,
                        lastLogin : lastLogin
                    })
                    var result = await User.createUser(user)
                    if(result){
                        res.status(200).json({'message' : 'User created'})
                    }
                    else res.status(500).json({'message' : 'Error creating user'})
                } catch(err) {
                    console.log(err)
                    res.status(500).json({'message' : 'Server error'})
                }
            }
    })

    app.get('/user/listFriends', [
        check('username')
            .not()
            .isEmpty()
        ], async(req, res)=>{
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            var username = req.body.username
            try{
                var friends = await User.findOne({username : username}, {friends : 1, _id : 0}).exec()
                res.status(200).json({message : friends})            
            } catch(err) {
                console.log(err)
                res.status(500).json({'message' : 'Server error'})
            }
    })

    app.get('/user/listRequestsReceived', [
        check('username')
            .not()
            .isEmpty()
        ], async(req, res)=>{
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            var username = req.body.username
            try{
                var requestsReceived = await User.findOne({username : username}, {requestsReceived : 1, _id : 0}).exec()
                res.status(200).json({message : requestsReceived})            
            } catch(err) {
                console.log(err)
                res.status(500).json({'message' : 'Server error'})
            }
    })

    app.get('/user/listRequestsSent', [
        check('username')
            .not()
            .isEmpty()
        ], async(req, res)=>{
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            var username = req.body.username
            try{
                var requestsSent = await User.findOne({username : username}, {requestsSent : 1, _id : 0}).exec()
                res.status(200).json({message : requestsSent})            
            } catch(err) {
                console.log(err)
                res.status(500).json({'message' : 'Server error'})
            }
    })
    
    app.post('/user/addFriend', [
        check('username')
            .not()
            .isEmpty(),
        check('addUsername')
            .not()
            .isEmpty()
        ], async(req, res)=>{
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            try{
                var addUsername = req.body.addUsername
                var username = req.body.username
                var addedUser = await User.findOne({'username': addUsername}).exec()
                var user = await User.findOne({'username' : username}).exec()
                if(!user || !addedUser) res.status(422).json({'message' : 'User is not registered'})
                addedUser.requestsReceived.push(username)
                addedUser.save()
                user.requestsSent.push(addUsername)
                user.save()
                res.status(200).json({'message': 'Request has been sent'})
            } catch(err){
                console.log(err)
                res.status(500).json({'message' : 'Server error'})
            }

        })

    app.post('/user/respondRequest', [
        check('username')
            .not()
            .isEmpty(),
        check('addUsername')
            .not()
            .isEmpty(),
        check('response')
            .not()
            .isEmpty()
        ], async(req, res)=>{
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            try{
                var addUsername = req.body.addUsername
                var username = req.body.username
                var response = req.body.response
                var addedUser = await User.findOne({'username': addUsername}).exec()
                var user = await User.findOne({'username' : username}).exec()
                if(!user || !addedUser) res.status(422).json({'message' : 'User is not registered'})
                else{
                    if(response == "Yes"){
                        var username_index = addedUser.requestsSent.indexOf(username)
                        addedUser.requestsSent.splice(username_index, 1)
                        addedUser.friends.push(username)
                        addedUser.save()
                        var addedusername_index = user.requestsReceived.indexOf(addUsername)
                        user.requestsReceived.splice(addedusername_index, 1)
                        user.friends.push(addUsername)
                        user.save()
                    }
                    else if(response == "No"){
                        var username_index = addedUser.requestsSent.indexOf(username)
                        addedUser.requestsSent.splice(username_index, 1)
                        addedUser.save()
                        var addedusername_index = user.requestsReceived.indexOf(addUsername)
                        user.requestsReceived.splice(addedusername_index, 1)
                        user.save()
                    }
                res.status(200).json({'message': 'Response has been recorded'})
                }
            } catch(err){
                console.log(err)
                res.status(500).json({'message' : 'Server error'})
            }

        })

}