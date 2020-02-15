//Module Imports
var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
const util = require('util');

//App
var app = express();
app.config = require('./config.json');

//DB Imports
const mongodbURL = app.config.DB_URL;
var mongoose = require('mongoose');
mongoose.connect(mongodbURL, { useNewUrlParser: true ,useUnifiedTopology: true });
var db = mongoose.connection;
app.db = db;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

(function () {
    /* Middleware functions */
    app.use(function (req, res, next) {
        /* Log the request in mongodb */
        db.collection('logs').insertOne({
            description: "Incoming request logged",
            time: Date.now(),
            parameters: {
                request: {
                    body: req.body,
                    ip: req.ip,
                    method: req.method,
                    path: req.originalUrl,
                    protocol: req.protocol,
                    authorization: req.headers['authorization'],
                    userAgent: req.get('User-Agent')
                }
            }
        },
            function (error, result) {

                if (error) {
                    console.log("Error encountered while trying to log  incoming request: " + error);
                } else {
                    console.log('------------------------------------------------------------------------------------------------------------------------');
                    console.log(new Date() + ' - Incoming request logged. Path: ' + req.originalUrl);
                    console.log('Request : ' + util.inspect(req.body, false, null, true /* enable colors */));
                    console.log('------------------------------------------------------------------------------------------------------------------------');
                }
                next();
            });
    });

    /* All routes to be defined here */
    require('./routes/auth')(app);
})();


/* Port for app to listen on */
app.listen(app.config.APP_PORT, function () {
    /* log server startup */

    db.collection('logs').insertOne({
        description: "Server re/started",
        time: Date.now(),
        parameters: {}
    },
        function (error, result) {
            if (error)
                console.log("!#! Error encountered while trying to log server re/start: " + error);
        });

    process.setMaxListeners(Infinity);
    console.log("### Server running on " + app.config.APP_PORT + "...");
});