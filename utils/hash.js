var bcrypt = require('bcryptjs')
var crypto = require('crypto')

module.exports.hashPassword = async function (pass) {
    const password = pass
    const saltRounds = 10;
    const hashedPassword = await new Promise((resolve, reject) => {
      bcrypt.hash(password, saltRounds, function(err, hash) {
        if (err) reject(err)
        resolve(hash)
      });
    })  

    return hashedPassword
}

module.exports.comparePassword = async function(plainPass, hashword) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(plainPass, hashword, function(err, isPasswordMatch) {   
        if(!err) resolve(isPasswordMatch)
        else reject(err)
    });
  });
}

module.exports.hashMeetupId = async function(string){
  return new Promise((resolve, reject)=>{
    var hashedMeetupId = crypto.createHash('md5').update(string.toString()).digest('hex')
    if(hashedMeetupId) resolve(hashedMeetupId)
    else reject('Error in hashing Meetup ID')
  })
}
