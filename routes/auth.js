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
}