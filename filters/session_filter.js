function validateSession(req, res, next) {
	console.error('validateSession check: ' + JSON.stringify(req.session.user) );

  //Check to see if there are ANY users defined - could be a new instance
  var ACS = require('acs').ACS;


  if(!req.session.user) {
    //res.send('Unauthenticated!');
	res.redirect('/?alert=notloggedin');
  } else {
    next();
  }
};