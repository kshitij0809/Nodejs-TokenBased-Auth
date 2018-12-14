const express = require('express');  
const http = require('http'); // you really want https here!
const app = express();
const passport=require('./models/generateJwt.js');

const bodyParser = require('body-parser');
// const express = require('express');
// const expressJwt = require('express-jwt');
// const http = require('http');
const logger = require('morgan');
// const jwt = require('jsonwebtoken');
// const passport = require('passport');
// const Strategy = require('passport-local');


const jwt = require('jsonwebtoken');
app.use(logger('dev'));
app.use(bodyParser.json());


const db = {  
  updateOrCreate: function(user, cb){
    // db dummy, we just cb the user
    cb(null, user);
  }
};
var serialize=(req, res, next)=> {  

	console.log('req.body');
  db.updateOrCreate(req.user, function(err, user){
    if(err) {return next(err);}
    // we store the updated information in req.user again
    req.user = {
      id: user.id
    };
    next();
  });
}


var generateToken=(req, res, next)=> {  
  req.token = jwt.sign({
    id: req.user.id,
  }, 'server secret', {
    expiresIn: 120
  });
  next();
}

var respond=(req, res) =>{  
  res.status(200).json({
    user: req.user,
    token: req.token
  });

  console.log("hello");
}


app.use(passport.initialize());  
app.post('/auth', passport.authenticate(  
  'local', {
    session: false
  }), serialize, generateToken, respond);





const expressJwt = require('express-jwt');  
const authenticate = expressJwt({secret : 'server secret'});
app.get('/me', authenticate, function(req, res) {  
  res.status(200).json(req.user);
});


app.listen(5000, function() {
  console.log('Express server listening on port 5000'); // eslint-disable-line
});


