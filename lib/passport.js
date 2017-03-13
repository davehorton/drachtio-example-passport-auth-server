'use strict';

const passport       = require('passport') ;
const DigestStrategy = require('passport-http').DigestStrategy; 


// simple in-memory database of users for example only
var users = [
    { id: 1, username: 'dhorton', password: '1234', domain: 'sip.drachtio.org'}
];

function findByUsername( username, fn )
{
    for (var i = 0, len = users.length; i < len; i++)
    {
        var user = users[i];
        if (user.username === username) { return fn( null, user ); }
    }
    return fn(null, null);
}

passport.use
(
  new DigestStrategy(
    { 
      qop: 'auth', 
      realm: 'sip.drachtio.org' 
    },
    ( username, done ) =>
    {
        // Find the user by username. If there is no user with the given username
        // set the user to `false` to indicate failure. Otherwise, return the
        // user and user's password.
        
        findByUsername(
            username, 
            function( err, user )
            {
                if ( err )   { return done( err ); }
                if ( !user ) { return done( null, false ); }

                return done( null, user, user.password );
            }
        );
    },
    (params, done) => {
      // validate nonces as necessary
      done(null, true) ;
    }
));

module.exports = passport ;


