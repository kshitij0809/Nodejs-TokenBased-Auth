// start with node authentication/basicScenario.js
'use strict';

///////////////////
// configuration //
///////////////////
const PORT = 5000; // still old...
const SECRET = 'server secret';
const TOKENTIME = 120 * 60; // in seconds

/////////////
// modules //
/////////////
const bodyParser = require('body-parser');
const crypto = require('crypto');
const express = require('express');
const expressJwt = require('express-jwt');
const http = require('http');
const jwt = require('jsonwebtoken');
const logger = require('morgan');
const passport = require('passport');
const Strategy = require('passport-local');

const db = require('./models/user.js');

const app = express();
const authenticate = expressJwt({
  secret: SECRET
});



//////////////
// passport //
//////////////
passport.use(new Strategy(
  function(username, password, done) {
    db.user.authenticate(username, password, done);
  }
));



////////////
// helper //
////////////

function serializeUser(req, res, next) {
  db.user.updateOrCreate(req.user, function(err, user) {
    if (err) {
      return next(err);
    }
    // we store information needed in token in req.user
    req.user = {
      id: user.id
    };
    next();
  });
}

function serializeClient(req, res, next) {
  if (req.query.permanent === 'true') {
    db.client.updateOrCreate({
      user: req.user
    }, function(err, client) {
      if (err) {
        return next(err);
      }
      // we store information needed in token in req.user
      req.user.clientId = client.id;
      next();
    });
  } else {
    next();
  }
}

function validateRefreshToken(req, res, next) {
  db.client.findUserOfToken(req.body, function(err, user) {
    if (err) {
      return next(err);
    }
    req.user = user;
    next();
  });
}

function rejectToken(req, res, next) {
  db.client.rejectToken(req.body, next);
}

//////////////////////
// token generation //
//////////////////////
function generateAccessToken(req, res, next) {
  req.token = req.token ||  {};
  req.token.accessToken = jwt.sign({
    id: req.user.id,
    clientId: req.user.clientId
  }, SECRET, {
    expiresIn: TOKENTIME
  });
  next();
}

function generateRefreshToken(req, res, next) {
  if (req.query.permanent === 'true') {
    req.token.refreshToken = req.user.clientId.toString() + '.' + crypto.randomBytes(
      40).toString('hex');
    db.client.storeToken({
      id: req.user.clientId,
      refreshToken: req.token.refreshToken
    }, next);
  } else {
    next();
  }
}

//////////////////////
// server responses //
//////////////////////
const respond = {
  auth: function(req, res) {
    res.status(200).json({
      user: req.user,
      token: req.token
    });
  },
  token: function(req, res) {
    res.status(201).json({
      token: req.token
    });
  },
  reject: function(req, res){
    res.status(204).end();
  }
};


////////////
// server //
////////////
app.use(logger('dev'));
app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.status(200).json({
    hello: 'world'
  });
});

app.post('/auth', passport.initialize(), passport.authenticate(
    'local', {
      session: false,
      scope: []
    }), serializeUser, serializeClient, generateAccessToken,
  generateRefreshToken, respond.auth);


app.get('/me', authenticate, function(req, res) {
  res.status(200).json(req.user);
});

app.post('/token', validateRefreshToken, generateAccessToken, respond.token);
app.post('/token/reject', rejectToken, respond.reject);

http.createServer(app).listen(PORT, function() {
  console.log('server listening on port ', PORT);
});