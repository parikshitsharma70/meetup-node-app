var User = require('../models/User')
var hash = require('../utils/hash')
var jwt = require('jsonwebtoken')

module.exports = function(app){
    var db = app.db

    app.post('/client/login', async(req, res)=>{
        if(req.body.username  && req.body.password ){
            var username = req.body.username
            var password = req.body.password
            var find = {
                'username' : username
            }
            try{
                var found = await User.findUser(find)
                if(!found){
                    res.status(401).json({ message : 'username invalid'})
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
                        res.status(401).json({ message: "Auth Failed" })
                    }
                }
        } catch(err){
            console.log(err)
            res.status(500).json({message  : 'Server Error'})
        }
    }
    else {
        res.status(400).json({'message' : 'Invalid Input Parameters'})
    }
})

    app.post('/client/signUp', async(req, res)=>{
        if(req.body.username && req.body.password && req.body.role){
            var username = req.body.username
            var password = req.body.password
            var firstName = req.body.firstName
            var lastName = req.body.lastName
            var email = req.body.email
            var city = req.body.city
            var state = req.body.state
            var role = 'user'
            var lastLogin = "Never"
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
        else{
            res.status(400).json({'message': 'Invalid input parameters'})
        }
        })
        
}