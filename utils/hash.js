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

module.exports.hashProjectId = async function(projectCount){
  return new Promise((resolve, reject)=>{
    var hashedProjectId = crypto.createHash('md5').update(projectCount.toString()).digest('hex')
    if(hashedProjectId) resolve(hashedProjectId)
    else reject('Error in hashing Project ID')
  })
}

module.exports.hashFileId = async function (fileTag){
    return new Promise((resolve, reject)=>{
        var hashedFileId = crypto.createHash('md5').update(fileTag.toString()).digest('hex')
        if(hashedFileId) resolve(hashedFileId)
        else reject('Error in hashing File ID')
      })
}