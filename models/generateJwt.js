'use strict';
const passport = require('passport');  
const Strategy = require('passport-local');
passport.use(new Strategy(  
  function(username, password, done) {
    console.log("hello 11");
    // database dummy - find user and verify password
    if(username === 'devils name' && password === '666'){
      done(null, {
        id: 666,
        firstname: 'devils',
        lastname: 'name',
        email: 'devil@he.ll',
        verified: true
      });
    }
    else {
      done(null, false);
    }
  }
));
module.exports = passport;
