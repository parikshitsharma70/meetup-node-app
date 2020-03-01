var config = require('../config.json')
var mongoose = require('mongoose')
const Schema = mongoose.Schema;

const userSchema = new Schema({
        username :  String,
        password :  String,
        firstName : String,
        lastName : String,
        email : String,
        city : String,
        state : String,
        friends : [{
            type: String
        }],
        requestsSent : [{
            type: String
        }],
        requestsReceived : [{
            type: String
        }],
        role :  String,
        lastLogin : String 
    })

var User =  mongoose.model('user', userSchema);
module.exports = User
userSchema.pre('save', function(next){
    next();
})

module.exports.createUser = async function(user){
    return new Promise(async (resolve, reject)=>{
        var find_clause = { 'username' : user.username }
        var found = await User.findUser(find_clause)
        if(!found){
            user.save(user, (err, res)=> {
                if (!err) {
                    resolve(res);
                }
                else {
                    console.log(err)
                    reject(err);
                }
            });
        }
        else{
            reject('User exists');
        }
    }); 
}

module.exports.findUser = async function(find_clause){
    return new Promise((resolve, reject)=>{
        User.findOne(find_clause, function(err, obj) {
            if (!err){ 
                resolve(obj);
            } else reject(err);
        })
    })
}

module.exports.findUserByUsername = async function(username){
    var user = await User.findOne({'username': username})
    return user
}

module.exports.getUserRole = async function(find_clause){
    return new Promise(async (resolve, reject)=>{
        var user = await User.findUser(find_clause)
        if(user){
            resolve(user.role)
        }
        else reject('Not found')
    })
}

module.exports.updateLastLogin = async function(find_clause){
    try{
        var doc = await User.findOne(find_clause)    
        return new Promise(async (resolve, reject)=>{
                if(doc){
                    var d = new Date()
                    doc.lastLogin = d.toUTCString()
                    var result = doc.save(doc)
                    if(result) resolve('Updated last login')
                    else reject('DB update error')
                }
                else{
                    reject('Customer not found')
                }       
            })
    } catch(err) {return(err)}
}
