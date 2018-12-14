'use strict';

/*************************************************************************************
 * database dummy                                                                    *
 *  note:                                                                            *
 *     this is a very simple dummy of a data model to get this example working.      *
 *     It has no claim to completeness nor makes it any sense in a real application. *
**************************************************************************************/
module.exports = {
  user: {
    updateOrCreate: function(user, cb) {
      // db dummy, we just cb the user
      cb(null, user);
    },
    authenticate: function(username, password, cb) {
      // database dummy - find user and verify password
      if (username === 'devils name' && password === '666') {
        cb(null, {
          id: 666,
          firstname: 'devils',
          lastname: 'name',
          email: 'devil@he.ll',
          verified: true
        });
      } else {
        cb(null, false);
      }
    }
  },
  client: {
    // db dummy for clients
    clients: [],
    clientCount: 0,
    updateOrCreate: function(data, cb) {
      let id = this.clientCount++;
      this.clients[id] = {
        id: id,
        userId: data.user.id
      };
      cb(null, {
        id: id
      });
    },
    storeToken: function(data, cb) {
      this.clients[data.id].refreshToken = data.refreshToken;
      cb();
    },
    findUserOfToken: function(data, cb) {
      if(!data.refreshToken){
        return cb(new Error('invalid token'));
      }
      for (let i = 0; i < this.clients.length; i++) {
        if (this.clients[i].refreshToken === data.refreshToken) {
          return cb(null, {
            id: this.clients[i].userId,
            clientId: this.clients[i].id
          });
        }
      }
      cb(new Error('not found'));
    },
    rejectToken: function(data, cb){
      for (let i = 0; i < this.clients.length; i++) {
        if (this.clients[i].refreshToken === data.refreshToken) {
          this.clients[i] = {};
          return cb();
        }
      }
      cb(new Error('not found'));
    }
  }
};