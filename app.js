'use strict';

const drachtio = require('drachtio') ;
const app = drachtio() ;
const Srf = require('drachtio-srf') ;
const srf = new Srf(app) ;
const Mrf = require('drachtio-fsmrf') ;
const mrf = new Mrf(app) ;
const config = require('./config') ;
const passport = require('./lib/passport');
let ms ;

srf.connect(config.drachtio) 
.on('connect', (err, hostport) => {
  console.log(`connected to drachtio listening for SIP on ${hostport}`) ;
})
.on('error', (err) => {
  console.error(`Error connecting to drachtio server: ${err}`) ;
}) ;

mrf.connect(config.mediaServer, (mediaServer) => {
  ms = mediaServer ;
  console.log(`connected to media server`);
}, (err) => {
  console.error(`Error connecting to media server ${err}`);
}) ;

app.use(passport.initialize());
app.use('register', passport.authenticate('digest', { session: false })) ;
app.use('invite', passport.authenticate('digest', { session: false })) ;

app.invite( (req,res) => {

  ms.connectCaller(req, res, (err, ep, dlg) => {
    if( err ) { throw err; }

    dlg.on('destroy', onHangup.bind(null, ep) ) ;
    ep.playCollect({file: 'ivr/8000/ivr-please_reenter_your_pin.wav'}, (err, results) => {
      if( err ) { throw( err ) ; }
      console.log(`playCollect finished: ${JSON.stringify(results)}`) ;
    }) ;
  });
});

function onHangup( ep ) {
  ep.destroy() ;
}
