var config = require('../config.json')
var mongoose = require('mongoose')
const Schema = mongoose.Schema;

const meetupSchema = new Schema({
        owner :  String,
        meetupId : String,
        title :  String,
        description : String,
        invited : [{
            type: String
        }],
        going : [{
            type: String
        }],
        notGoing : [{
            type: String
        }],
        maybe : [{
            type: String
        }],
        street : String,
        city : String,
        state : String,
        datetime : Date,
        duration : String,
        createdAt : Date
    })

var Meetup =  mongoose.model('meetup', meetupSchema);
module.exports = Meetup
meetupSchema.pre('save', function(next){
    next();
})

module.exports.createMeetup = async function(meetup){
    return new Promise(async (resolve, reject)=>{
        var find_clause = { 'meetupId' : meetup.meetupId }
        var found = await Meetup.findMeetup(find_clause)
        if(!found){
            meetup.save(meetup, (err, res)=> {
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
            reject('Meetup exists');
        }
    }); 
}

module.exports.findMeetup = async function(find_clause){
    Meetup.findOne(find_clause, function(err, obj) {
        return new Promise((resolve, reject)=>{
            if (!err){ 
                resolve(obj);
            } else reject(err);
        })
    })
}